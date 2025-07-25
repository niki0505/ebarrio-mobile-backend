import FAQ from "../models/FAQs.js";

export const getFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find();

    return res.status(200).json(faqs);
  } catch (error) {
    console.error("Error in getting FAQs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
