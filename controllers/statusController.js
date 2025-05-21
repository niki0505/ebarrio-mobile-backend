import Resident from "../models/Residents.js";
import User from "../models/Users.js";
import Certificate from "../models/Certificates.js";
import CourtReservation from "../models/CourtReservations.js";
import Blotter from "../models/Blotters.js";

export const getServicesSubmitted = async (req, res) => {
  try {
    const { userID } = req.params;
    const user = await User.findById(userID);
    console.log(user.resID);

    const resID = user.resID;

    const certificates = await Certificate.find(
      { resID: resID },
      { certID: 0 }
    );

    const reservations = await CourtReservation.find({ resID: resID });

    const blotters = await Blotter.find({ complainantID: resID });

    const certificatesWithType = certificates.map((c) => ({
      ...c.toObject(),
      type: "Certificate",
    }));
    const reservationsWithType = reservations.map((r) => ({
      ...r.toObject(),
      type: "Reservation",
    }));
    const blottersWithType = blotters.map((b) => ({
      ...b.toObject(),
      type: "Blotter",
    }));

    const combined = [
      ...certificatesWithType,
      ...reservationsWithType,
      ...blottersWithType,
    ];

    res.status(200).json(combined);
  } catch (error) {
    console.log("Error getting services submitted", error);
    res.status(500).json({ message: "Failed to get services submitted" });
  }
};
