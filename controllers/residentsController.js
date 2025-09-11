import Resident from "../models/Residents.js";
import Household from "../models/Households.js";
import moment from "moment";

export const createResident = async (req, res) => {
  try {
    const {
      picture,
      signature,
      firstname,
      middlename,
      lastname,
      suffix,
      alias,
      salutation,
      sex,
      gender,
      birthdate,
      birthplace,
      civilstatus,
      bloodtype,
      religion,
      nationality,
      voter,
      precinct,
      deceased,
      email,
      mobilenumber,
      telephone,
      facebook,
      emergencyname,
      emergencymobilenumber,
      emergencyaddress,
      employmentstatus,
      occupation,
      monthlyincome,
      educationalattainment,
      typeofschool,
      course,
      head,
      isPregnant,
      isSenior,
      isInfant,
      isNewborn,
      isUnder5,
      isSchoolAge,
      isAdolescent,
      isAdolescentPregnant,
      isAdult,
      isPostpartum,
      isWomenOfReproductive,
      isPWD,
      householdForm,
      householdno,
      householdposition,
      philhealthid,
      philhealthtype,
      philhealthcategory,
      haveHypertension,
      haveDiabetes,
      haveTubercolosis,
      haveSurgery,
      lastmenstrual,
      haveFPmethod,
      fpmethod,
      fpstatus,
    } = req.body;

    const birthDate = moment(birthdate, "YYYY/MM/DD");
    const age = moment().diff(birthDate, "years");

    const resident = new Resident({
      picture,
      signature,
      firstname,
      middlename,
      lastname,
      suffix,
      alias,
      salutation,
      sex,
      gender,
      birthdate,
      age,
      birthplace,
      civilstatus,
      bloodtype,
      religion,
      nationality,
      voter,
      precinct,
      deceased,
      email,
      mobilenumber,
      telephone,
      facebook,
      emergencyname,
      emergencymobilenumber,
      emergencyaddress,
      employmentstatus,
      occupation,
      monthlyincome,
      educationalattainment,
      typeofschool,
      course,
      isPregnant,
      isSenior,
      isInfant,
      isNewborn,
      isUnder5,
      isSchoolAge,
      isAdolescent,
      isAdolescentPregnant,
      isAdult,
      isPostpartum,
      isWomenOfReproductive,
      isPWD,
      philhealthid,
      philhealthtype,
      philhealthcategory,
      haveHypertension,
      haveDiabetes,
      haveTubercolosis,
      haveSurgery,
      lastmenstrual,
      haveFPmethod,
      fpmethod,
      fpstatus,
    });
    await resident.save();

    let members = [...householdForm.members];

    if (head === "Yes") {
      members.push({
        resID: resident._id,
        position: "Head",
      });

      const household = new Household({
        ...householdForm,
        members,
      });
      household.status = "Pending";
      await household.save();

      await Resident.findByIdAndUpdate(resident._id, {
        householdno: household._id,
      });

      // await Promise.all(
      //   members.map(({ resID }) =>
      //     Resident.findByIdAndUpdate(resID, { householdno: household._id })
      //   )
      // );
    } else if (head === "No") {
      if (householdno && householdposition) {
        const household = await Household.findById(householdno);
        if (household) {
          resident.set("householdno", householdno);

          const alreadyMember = household.members.some(
            (m) => m.resID.toString() === resident._id.toString()
          );

          if (!alreadyMember) {
            household.members.push({
              resID: resident._id,
              position: householdposition,
            });
          }

          household.status = "Change Requested";

          await resident.save();
          await household.save();
        }
      }
    }

    res.status(200).json({
      message: "Resident successfully created",
      resID: resident._id,
    });
  } catch (error) {
    console.log("Error creating resident", error);
    res.status(500).json({ message: "Failed to create resident" });
  }
};

export const getAllResidents = async (req, res) => {
  try {
    const residents = await Resident.find({
      status: { $nin: ["Archived", "Rejected"] },
    })
      .select("-empID")
      .populate("empID")
      .populate("householdno")
      .exec();
    res.status(200).json(residents);
  } catch (error) {
    console.log("Error fetching residents", error);
    res.status(500).json({ message: "Failed to fetch residents" });
  }
};
