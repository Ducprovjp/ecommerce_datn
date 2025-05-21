const algoliasearch = require("algoliasearch");
const axios = require("axios");
const natural = require("natural");

const syncSuggestionsToAlgolia = async () => {
  try {
    // Kiểm tra REACT_APP_SERVER
    if (!process.env.REACT_APP_SERVER) {
      throw new Error("REACT_APP_SERVER is not defined in .env");
    }
    console.log("Using REACT_APP_SERVER:", process.env.REACT_APP_SERVER);

    // Khởi tạo Algolia client
    const client = algoliasearch(
      process.env.ALGOLIA_APP_ID || "PJS0OQNW89",
      process.env.ALGOLIA_WRITE_API_KEY || "951c952feba4c5cab6db5b69d11cfd33"
    );
    const suggestionIndex = client.initIndex("query_suggestions");

    // Xóa toàn bộ gợi ý cũ
    console.log("Clearing old suggestions...");
    await suggestionIndex.clearObjects();
    console.log("Old suggestions cleared");

    // Tạo URL cho API
    const apiUrl = `${process.env.REACT_APP_SERVER}/product/get-all-products`;
    console.log("Calling API:", apiUrl);

    // Lấy sản phẩm từ API
    const response = await axios.get(apiUrl, {
      params: { limit: 1000 },
    });
    const products = response.data.products || [];
    console.log(`Fetched ${products.length} products`);

    // Hàm tạo n-grams (cụm từ 2-3 từ)
    const generateNGrams = (text, min = 2, max = 3) => {
      if (!text) return [];
      // Loại bỏ ký tự đặc biệt và chuẩn hóa
      const cleanText = text.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
      const tokenizer = new natural.WordTokenizer();
      const words = tokenizer.tokenize(cleanText);
      const ngrams = [];
      for (let n = min; n <= max; n++) {
        for (let i = 0; i <= words.length - n; i++) {
          const ngram = words.slice(i, i + n).join(" ");
          ngrams.push(ngram);
        }
      }
      return ngrams;
    };

    // Danh sách từ khóa lỗi
    const stopWords = [
      "và", "của", "cho", "là", "để", "tặng", "khâu", "bảo", "hành", "trọn",
      "đời", "kim", "tất", "hộp", "túi", "đựng", "mọi", "lứa", "tuổi", "phù",
      "hợp", "khi", "vận", "động", "co", "giãn", "thoải", "mái", "giữ", "nhiệt",
      "tq", "tf", "morelia", "wika", "đinh"
    ];

    // Từ khóa ngành để bổ sung gợi ý
    const industryKeywords = [
      "thể thao", "đá bóng", "sneaker", "lười", "chạy bộ", "da", "cao gót",
      "bóng rổ", "leo núi", "tập gym", "áo", "quần", "bóng đá", "búp bê",
      "sandal", "body", "unisex", "nike", "adidas", "mizuno"
    ];

    // Từ khóa chính để tạo gợi ý
    const mainKeywords = ["giày", "áo", "quần"];

    // Tạo gợi ý từ name
    const ngramFrequency = {};
    const suggestions = products.reduce((acc, product) => {
      if (!product.name) return acc;

      // Tạo n-grams từ name
      const nameNGrams = generateNGrams(product.name);

      // Đếm tần suất n-grams
      nameNGrams.forEach((ngram) => {
        ngramFrequency[ngram] = (ngramFrequency[ngram] || 0) + 1;
      });

      // Lọc gợi ý
      const productSuggestions = nameNGrams
        .filter((query) => {
          const words = query.split(" ");
          const hasMainKeyword = mainKeywords.some((keyword) =>
            query.includes(keyword)
          );
          return (
            (hasMainKeyword || industryKeywords.some((keyword) => query.includes(keyword))) &&
            words.length >= 2 &&
            words.length <= 3 &&
            query.length >= 5 &&
            query.length <= 20 &&
            !stopWords.some((stopword) => query.includes(stopword)) &&
            !/[0-9]/.test(query) // Loại bỏ số
          );
        })
        .map((query, index) => ({
          objectID: `${product._id}_${index}`,
          query: query,
        }));

      return [...acc, ...productSuggestions];
    }, []);

    // Bổ sung gợi ý từ từ khóa ngành
    const industrySuggestions = industryKeywords
      .flatMap((keyword) =>
        mainKeywords.map((mainKeyword) => `${mainKeyword} ${keyword}`)
      )
      .filter((query) =>
        products.some((product) =>
          product.name.toLowerCase().includes(query.split(" ")[1])
        )
      )
      .map((query, index) => ({
        objectID: `industry_${index}`,
        query: query,
      }));

    // Kết hợp gợi ý
    const allSuggestions = [...suggestions, ...industrySuggestions];

    // Loại bỏ trùng lặp
    const uniqueSuggestions = allSuggestions.reduce((acc, curr) => {
      if (!acc.some((item) => item.query === curr.query)) {
        acc.push(curr);
      }
      return acc;
    }, []);

    // Lọc dựa trên tần suất (điều chỉnh theo số sản phẩm)
    const minFrequency = products.length > 50 ? 2 : 1;
    const filteredSuggestions = uniqueSuggestions.filter(
      (suggestion) => ngramFrequency[suggestion.query] >= minFrequency
    );

    // Sắp xếp theo tần suất
    filteredSuggestions.sort((a, b) => {
      const freqA = ngramFrequency[a.query] || 1;
      const freqB = ngramFrequency[b.query] || 1;
      return freqB - freqA; // Giảm dần theo tần suất
    });

    // Giới hạn tối đa 100 gợi ý
    const finalSuggestions = filteredSuggestions.slice(0, 100);

    // Đẩy lên Algolia
    await suggestionIndex.saveObjects(finalSuggestions);
    console.log(`Successfully synced ${finalSuggestions.length} suggestions to Algolia`);

    // Cấu hình index
    await suggestionIndex.setSettings({
      searchableAttributes: ["query"],
      ranking: ["asc(query)"],
    });
    console.log("Query suggestions index settings updated");
  } catch (error) {
    console.error("Error syncing suggestions to Algolia:", error.message);
    if (error.response) {
      console.error("API response error:", error.response.data);
    }
    throw error;
  }
};

module.exports = syncSuggestionsToAlgolia;