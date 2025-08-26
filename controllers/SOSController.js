import SOS from "../models/SOS.js";
import { rds } from "../index.js";
import { getActiveSOSUtils } from "../utils/collectionUtils.js";

export const cancelSOS = async (req, res) => {
  try {
    const { userID, resID } = req.user;
    const { reportID } = req.params;

    const isLimited = await rds.get(`limitCancellation_${userID}`);
    if (isLimited) {
      return res.status(403).json({
        message: "You have reached the maximum of 3 cancellations for today.",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const cancelledCount = await SOS.countDocuments({
      resID,
      status: "Cancelled",
      updatedAt: { $gte: today, $lt: tomorrow },
    });

    if (cancelledCount >= 3) {
      await rds.setex(`limitCancellation_${userID}`, 86400, "true");
      return res.status(403).json({
        message: "You have reached the maximum of 3 cancellations for today.",
      });
    }

    const report = await SOS.findById(reportID);

    report.status = "Cancelled";

    await report.save();

    return res
      .status(200)
      .json({ message: "SOS report cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRespondedSOS = async (req, res) => {
  try {
    const { empID } = req.user;
    const reports = await SOS.find({
      "responder.empID": empID,
      status: { $in: ["Resolved", "False Alarm"] },
    }).populate({
      path: "resID",
      select: "firstname lastname age mobilenumber picture householdno",
      populate: {
        path: "householdno",
        select: "address",
      },
    });
    return res.status(200).json(reports);
  } catch (error) {
    console.error("Error get responded SOS:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const submitFalseAlarm = async (req, res) => {
  try {
    const { reportID } = req.params;
    const { falseAlarmForm } = req.body;

    const report = await SOS.findById(reportID);

    report.postreportdetails = falseAlarmForm.postreportdetails;
    report.evidence = falseAlarmForm.evidence;
    report.status = "False Alarm";

    await report.save();

    return res
      .status(200)
      .json({ message: "You have marked the report as a false alarm." });
  } catch (error) {
    console.error("Error submitting false alarm report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const submitPostIncident = async (req, res) => {
  try {
    const { reportID } = req.params;
    const { postIncidentForm } = req.body;

    const report = await SOS.findById(reportID);

    report.postreportdetails = postIncidentForm.postreportdetails;
    report.evidence = postIncidentForm.evidence;
    report.status = "Resolved";

    await report.save();

    return res
      .status(200)
      .json({ message: "The report has been successfully resolved." });
  } catch (error) {
    console.error("Error submitting post incident report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const didntArriveSOS = async (req, res) => {
  try {
    const { empID } = req.user;
    const { reportID } = req.params;
    const report = await SOS.findById(reportID);

    const responder = report.responder.find(
      (rep) => rep.empID.toString() === empID
    );

    if (!responder) {
      return res.status(400).json({ message: "You are not a responder yet" });
    }

    const responderIndex = report.responder.findIndex(
      (rep) => rep.empID.toString() === empID
    );

    const currentResponder = report.responder[responderIndex];

    if (currentResponder.isHead && report.responder.length > 1) {
      report.responder[responderIndex + 1].isHead = true;
    }

    if (report.responder.length === 1) {
      report.status = "Pending";
    }
    report.responder.splice(responderIndex, 1);

    await report.save();

    return res.status(200).json({
      message:
        "You have marked yourself as did not arrive at the report location.",
    });
  } catch (error) {
    console.error("Error get pending SOS:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const arrivedSOS = async (req, res) => {
  try {
    const { empID } = req.user;
    const { reportID } = req.params;
    const report = await SOS.findById(reportID);

    const responder = report.responder.find(
      (rep) => rep.empID.toString() === empID
    );

    if (!responder) {
      return res.status(400).json({ message: "You are not a responder yet" });
    }

    responder.status = "Arrived";
    responder.arrivedat = new Date();

    await report.save();

    return res.status(200).json({
      message: "You have marked yourself as arrived at the report location.",
    });
  } catch (error) {
    console.error("Error get pending SOS:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const headingSOS = async (req, res) => {
  try {
    const { empID } = req.user;
    const { reportID } = req.params;
    const report = await SOS.findById(reportID);
    const alreadyResponder = report.responder.some(
      (r) => r.empID.toString() === empID
    );
    if (alreadyResponder) {
      return res.status(400).json({ message: "You are already a responder" });
    }

    const isHead = report.responder.length === 0;

    report.responder.push({
      empID,
      status: "Heading",
      arrivedat: null,
      isHead,
    });

    report.status = "Ongoing";

    await report.save();

    return res.status(200).json({
      message: "You have marked yourself as heading at the report location.",
    });
  } catch (error) {
    console.error("Error get pending SOS:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPendingSOS = async (req, res) => {
  try {
    const reports = await SOS.find({
      status: { $in: ["Pending", "Ongoing"] },
    }).populate({
      path: "resID",
      select: "firstname lastname age mobilenumber picture householdno",
      populate: {
        path: "householdno",
        select: "address",
      },
    });

    return res.status(200).json(reports);
  } catch (error) {
    console.error("Error get pending SOS:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getActiveSOS = async (req, res) => {
  try {
    const { resID } = req.user;
    const report = await getActiveSOSUtils(resID);

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
