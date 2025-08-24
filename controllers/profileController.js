import Resident from "../models/Residents.js";
import Household from "../models/Households.js";
import User from "../models/Users.js";
import ChangeHousehold from "../models/ChangeHouseholds.js";
import ChangeResident from "../models/ChangeResident.js";
import moment from "moment";
import ActivityLog from "../models/ActivityLogs.js";

export const updateResident = async (req, res) => {
  try {
    const { userID, resID, empID } = req.user;
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
      HOAname,
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
      householdno,
      householdposition,
      householdForm,
    } = req.body;

    const birthDate = moment(birthdate, "YYYY/MM/DD");
    const age = moment().diff(birthDate, "years");

    const resident = await Resident.findById(resID);

    const household = await Household.findById(resident.householdno);

    const isHead = household?.members?.some(
      (member) =>
        member.resID.toString() === resident._id.toString() &&
        member.position === "Head"
    );

    resident.picture = picture;
    resident.signature = signature;
    resident.firstname = firstname;
    resident.middlename = middlename;
    resident.lastname = lastname;
    resident.suffix = suffix;
    resident.alias = alias;
    resident.salutation = salutation;
    resident.sex = sex;
    resident.gender = gender;
    resident.birthdate = birthdate;
    resident.age = age;
    resident.birthplace = birthplace;
    resident.civilstatus = civilstatus;
    resident.bloodtype = bloodtype;
    resident.religion = religion;
    resident.nationality = nationality;
    resident.voter = voter;
    resident.precinct = precinct;
    resident.deceased = deceased;
    resident.email = email;
    resident.mobilenumber = mobilenumber;
    resident.telephone = telephone;
    resident.facebook = facebook;
    resident.emergencyname = emergencyname;
    resident.emergencymobilenumber = emergencymobilenumber;
    resident.emergencyaddress = emergencyaddress;
    resident.HOAname = HOAname;
    resident.employmentstatus = employmentstatus;
    resident.occupation = occupation;
    resident.monthlyincome = monthlyincome;
    resident.educationalattainment = educationalattainment;
    resident.typeofschool = typeofschool;
    resident.course = course;
    resident.isSenior = isSenior;
    resident.isInfant = isInfant;
    resident.isNewborn = isNewborn;
    resident.isUnder5 = isUnder5;
    resident.isSchoolAge = isSchoolAge;
    resident.isAdolescent = isAdolescent;
    resident.isAdolescentPregnant = isAdolescentPregnant;
    resident.isAdult = isAdult;
    resident.isPostpartum = isPostpartum;
    resident.isWomenOfReproductive = isWomenOfReproductive;
    resident.isPWD = isPWD;
    resident.isPregnant = isPregnant;
    resident.philhealthid = philhealthid;
    resident.philhealthtype = philhealthtype;
    resident.philhealthcategory = philhealthcategory;
    resident.haveHypertension = haveHypertension;
    resident.haveDiabetes = haveDiabetes;
    resident.haveTubercolosis = haveTubercolosis;
    resident.haveSurgery = haveSurgery;
    resident.lastmenstrual = lastmenstrual;
    resident.haveFPmethod = haveFPmethod;
    resident.fpmethod = fpmethod;
    resident.fpstatus = fpstatus;
    resident.householdno = householdno;

    if (isHead) {
      household.members = householdForm.members;
      household.vehicles = householdForm.vehicles;
      household.ethnicity = householdForm.ethnicity;
      household.tribe = householdForm.tribe;
      household.sociostatus = householdForm.sociostatus;
      household.nhtsno = householdForm.nhtsno;
      household.watersource = householdForm.watersource;
      household.toiletfacility = householdForm.toiletfacility;
      household.address = householdForm.address;

      const oldHousehold = household.toObject();
      const { _id, ...rest } = oldHousehold;

      if (!empID) {
        const og = await ChangeHousehold.create({
          ...rest,
        });
        household.status = "Change Requested";
        household.changeID = og._id;
      }
      await household.save();
    } else {
      const newhousehold = await Household.findById(householdno);

      const sameHousehold =
        resident.householdno.toString() === newhousehold._id.toString();

      if (sameHousehold) {
        const currentRecord = newhousehold.members.find(
          (m) => m.resID.toString() === resident._id.toString()
        );
        if (currentRecord.position !== householdposition) {
          const memberIndex = newhousehold.members.findIndex(
            (m) => m.resID.toString() === resident._id.toString()
          );

          if (memberIndex !== -1) {
            const oldHousehold = newhousehold.toObject();
            const { _id, ...rest } = oldHousehold;

            newhousehold.members[memberIndex].position = householdposition;
            if (!empID) {
              const og = await ChangeHousehold.create({
                ...rest,
              });
              newhousehold.status = "Change Requested";
              newhousehold.changeID = og._id;
            }

            await newhousehold.save();
          }
        }
      }
    }

    if (empID) {
      await ActivityLog.insertOne({
        userID: userID,
        action: "Residents",
        description: `User updated their resident profile.`,
      });
    } else {
      await ActivityLog.insertOne({
        userID: userID,
        action: "Residents",
        description: `User requested a change to their resident profile.`,
      });
    }

    const oldResident = resident.toObject();
    const { _id, ...rest } = oldResident;

    const og = await ChangeResident.create({
      ...rest,
    });
    resident.status = "Change Requested";
    resident.changeID = og._id;
    await resident.save();

    res.status(200).json({ message: "Resident successfully updated" });
  } catch (error) {
    console.log("Error updating resident", error);
    res.status(500).json({ message: "Failed to update resident" });
  }
};

export const getHousehold = async (req, res) => {
  try {
    const { householdID } = req.params;
    const household = await Household.findById(householdID).populate(
      "members.resID"
    );
    res.status(200).json(household);
  } catch (error) {
    console.log("Error fetching household", error);
    res.status(500).json({ message: "Failed to fetch household" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { resID } = req.user;
    const resident = await Resident.findById(resID)
      .select("-empID")
      .populate("empID")
      .populate("householdno")
      .exec();
    res.status(200).json(resident);
  } catch (error) {
    console.log("Error fetching profile", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};
