import Resident from "../models/Residents.js";
import Employee from "../models/Employees.js";
import Household from "../models/Household.js";

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
      address,
      mother,
      father,
      spouse,
      siblings,
      children,
      HOAname,
      employmentstatus,
      occupation,
      monthlyincome,
      educationalattainment,
      typeofschool,
      course,
      head,
      is4Ps,
      isPregnant,
      isSenior,
      isInfant,
      isChild,
      isPWD,
      isSoloParent,
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

    const motherAsObjectId = mother
      ? new mongoose.Types.ObjectId(mother)
      : null;
    const fatherAsObjectId = father
      ? new mongoose.Types.ObjectId(father)
      : null;
    const spouseAsObjectId = spouse
      ? new mongoose.Types.ObjectId(spouse)
      : null;

    const siblingsAsObjectIds =
      siblings && siblings.length > 0
        ? siblings.map((siblingId) => new mongoose.Types.ObjectId(siblingId))
        : [];

    const childrenAsObjectIds =
      children && children.length > 0
        ? children.map((childrenId) => new mongoose.Types.ObjectId(childrenId))
        : [];

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
      address,
      mother: motherAsObjectId,
      father: fatherAsObjectId,
      spouse: spouseAsObjectId,
      siblings: siblingsAsObjectIds,
      children: childrenAsObjectIds,
      HOAname,
      employmentstatus,
      occupation,
      monthlyincome,
      educationalattainment,
      typeofschool,
      course,
      is4Ps,
      isPregnant,
      isSenior,
      isChild,
      isInfant,
      isPWD,
      isSoloParent,
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
    console.log(householdForm);
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
      await household.save();

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
    const residents = await Resident.find()
      .select("-empID")
      .populate("empID")
      .exec();
    res.status(200).json(residents);
  } catch (error) {
    console.log("Error fetching residents", error);
    res.status(500).json({ message: "Failed to fetch residents" });
  }
};
