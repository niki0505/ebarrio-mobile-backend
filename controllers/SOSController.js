import SOS from "../models/SOS.js";

export const getRespondedSOS = async (req, res) => {
  try {
    const { empID } = req.user;
    const reports = await SOS.find({
      "responder.empID": empID,
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
      .json({ message: "Post incident report submitted successfully" });
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

    return res.status(200).json({ message: "You arrived to the SOS report" });
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

    return res
      .status(200)
      .json({ message: "You are now heading to the SOS report" });
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
    const report = await SOS.find({
      status: { $in: ["Pending", "Ongoing"] },
      resID: resID,
    }).populate({
      path: "responder.empID",
      select: "resID position",
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
