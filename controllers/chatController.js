import FAQ from "../models/FAQs.js";
import User from "../models/Users.js";

export const getActive = async (req, res) => {
  try {
    const secretary = await User.findOne({ role: "Secretary" });
    const clerk = await User.findOne({ role: "Clerk" });

    const secretaryOnline = secretary?.status === "Active";
    const clerkOnline = clerk?.status === "Active";

    return res.status(200).json({
      Secretary: secretaryOnline,
      Clerk: clerkOnline,
    });
  } catch (error) {
    console.error("Error checking active status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find();

    return res.status(200).json(faqs);
  } catch (error) {
    console.error("Error in getting FAQs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
