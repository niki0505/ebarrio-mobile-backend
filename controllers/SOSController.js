import SOS from "../models/SOS.js";

export const getActiveSOS = async (req, res) => {
  try {
    const { resID } = req.user;
    const report = await SOS.find({
      status: { $in: ["Pending", "Ongoing"] },
      resID: resID,
    }).populate({
      path: "responder.empID",
      select: "resID",
      populate: {
        path: "resID",
        select: "firstname lastname mobilenumber picture",
      },
    });

    return res.status(200).json(report);
  } catch (error) {
    console.error("Error get active SOS:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendSOS = async (req, res) => {
  try {
    const { resID } = req.user;
    const { location } = req.body;

    const report = new SOS({
      location,
      resID,
    });

    await report.save();

    return res.status(200).json({ message: "SOS has been sent successfully." });
  } catch (error) {
    console.error("Error sending SOS:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
