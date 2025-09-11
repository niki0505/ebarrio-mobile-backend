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
      head,
      householdForm,
    } = req.body;

    const birthDate = moment(birthdate, "YYYY/MM/DD");
    const age = moment().diff(birthDate, "years");

    const resident = await Resident.findById(resID);

    // resident.picture = picture;
    // resident.signature = signature;
    // resident.firstname = firstname;
    // resident.middlename = middlename;
    // resident.lastname = lastname;
    // resident.suffix = suffix;
    // resident.alias = alias;
    // resident.salutation = salutation;
    // resident.sex = sex;
    // resident.gender = gender;
    // resident.birthdate = birthdate;
    // resident.age = age;
    // resident.birthplace = birthplace;
    // resident.civilstatus = civilstatus;
    // resident.bloodtype = bloodtype;
    // resident.religion = religion;
    // resident.nationality = nationality;
    // resident.voter = voter;
    // resident.precinct = precinct;
    // resident.deceased = deceased;
    // resident.email = email;
    // resident.mobilenumber = mobilenumber;
    // resident.telephone = telephone;
    // resident.facebook = facebook;
    // resident.emergencyname = emergencyname;
    // resident.emergencymobilenumber = emergencymobilenumber;
    // resident.emergencyaddress = emergencyaddress;
    // resident.HOAname = HOAname;
    // resident.employmentstatus = employmentstatus;
    // resident.occupation = occupation;
    // resident.monthlyincome = monthlyincome;
    // resident.educationalattainment = educationalattainment;
    // resident.typeofschool = typeofschool;
    // resident.course = course;
    // resident.isSenior = isSenior;
    // resident.isInfant = isInfant;
    // resident.isNewborn = isNewborn;
    // resident.isUnder5 = isUnder5;
    // resident.isSchoolAge = isSchoolAge;
    // resident.isAdolescent = isAdolescent;
    // resident.isAdolescentPregnant = isAdolescentPregnant;
    // resident.isAdult = isAdult;
    // resident.isPostpartum = isPostpartum;
    // resident.isWomenOfReproductive = isWomenOfReproductive;
    // resident.isPWD = isPWD;
    // resident.isPregnant = isPregnant;
    // resident.philhealthid = philhealthid;
    // resident.philhealthtype = philhealthtype;
    // resident.philhealthcategory = philhealthcategory;
    // resident.haveHypertension = haveHypertension;
    // resident.haveDiabetes = haveDiabetes;
    // resident.haveTubercolosis = haveTubercolosis;
    // resident.haveSurgery = haveSurgery;
    // resident.lastmenstrual = lastmenstrual;
    // resident.haveFPmethod = haveFPmethod;
    // resident.fpmethod = fpmethod;
    // resident.fpstatus = fpstatus;
    // resident.householdno = householdno;

    const household = await Household.findById(resident.householdno);

    // If the resident has chosen household
    if (household) {
      const isHead = household?.members?.some(
        (member) =>
          member.resID.toString() === resident._id.toString() &&
          member.position === "Head"
      );

      if (isHead) {
        const headMember = household.members.find((m) => m.position === "Head");

        if (!empID) {
          // ✅ Case A: Head is moving OUT of this household
          if (
            householdno &&
            householdno.toString() !== resident.householdno.toString()
          ) {
            const updated = await ChangeResident.create({
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
              HOAname,
              employmentstatus,
              occupation,
              monthlyincome,
              educationalattainment,
              typeofschool,
              course,
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
              isPregnant,
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
              head,
            });
            resident.changeID = updated._id;
            resident.status = "Change Requested";
          }
          // ✅ Case B: Head is staying in the same household
          else if (
            householdno &&
            householdno.toString() === resident.householdno.toString()
          ) {
            const updated = await ChangeHousehold.create({
              members: [headMember, ...householdForm.members],
              vehicles: householdForm.vehicles,
              ethnicity: householdForm.ethnicity,
              tribe: householdForm.tribe,
              sociostatus: householdForm.sociostatus,
              nhtsno: householdForm.nhtsno,
              watersource: householdForm.watersource,
              toiletfacility: householdForm.toiletfacility,
              address: householdForm.address,
            });
            household.status = "Change Requested";
            household.change.push({ changeID: updated._id });
          }
        } else {
          if (
            householdno &&
            householdno.toString() !== resident.householdno.toString()
          ) {
            const otherActiveMembers = household.members.filter(
              (mem) => mem.resID.toString() !== resident._id.toString()
            );

            let eligibleMembers = otherActiveMembers.filter(
              (mem) => mem.resID.age >= 18
            );

            if (!eligibleMembers.length) eligibleMembers = otherActiveMembers;

            if (eligibleMembers.length) {
              // Pick oldest as new Head
              const newHead = eligibleMembers.reduce((prev, curr) =>
                curr.resID.age > prev.resID.age ? curr : prev
              );

              household.members = household.members.map((mem) => {
                if (mem.resID.toString() === newHead.resID.toString()) {
                  return { ...mem, position: "Head" };
                }
                return mem;
              });

              household.members = household.members.filter(
                (mem) => mem.resID.toString() !== resident._id.toString()
              );
            } else {
              // No eligible members → archive household
              household.status = "Archived";
            }
            newHouse.members.push({
              resID: resident._id,
              position: updated.householdposition,
            });
          } else if (
            householdno &&
            householdno.toString() === resident.householdno.toString()
          ) {
            // Employee override
            const oldMemberIds = household.members
              .filter((m) => m.position !== "Head")
              .map((m) =>
                m.resID._id ? m.resID._id.toString() : m.resID.toString()
              );
            const newMemberIds = householdForm.members.map((m) =>
              m.resID._id ? m.resID._id.toString() : m.resID.toString()
            );

            const memberIdsChanged =
              oldMemberIds.length !== newMemberIds.length ||
              oldMemberIds.some((id) => !newMemberIds.includes(id));

            if (memberIdsChanged) {
              // Only then do the remove/add logic
              for (const oldId of oldMemberIds) {
                if (!newMemberIds.includes(oldId)) {
                  const resident = await Resident.findById(oldId);
                  if (resident) {
                    resident.householdno = undefined;
                    await resident.save();
                  }
                }
              }

              for (const newId of newMemberIds) {
                if (!oldMemberIds.includes(newId)) {
                  const resident = await Resident.findById(newId);
                  if (resident) {
                    resident.householdno = household._id;
                    await resident.save();
                  }
                }
              }
            }

            // Update household fields no matter what

            const headMember = household.members.find(
              (m) => m.position === "Head"
            );
            household.members = [headMember, ...householdForm.members];
            household.vehicles = householdForm.vehicles;
            household.ethnicity = householdForm.ethnicity;
            household.tribe = householdForm.tribe;
            household.sociostatus = householdForm.sociostatus;
            household.nhtsno = householdForm.nhtsno;
            household.watersource = householdForm.watersource;
            household.toiletfacility = householdForm.toiletfacility;
            household.address = householdForm.address;
          }
        }

        await household.save();
      } else {
        // 🟢 Case C: Resident is NOT head and moving to another household
        if (householdno) {
          if (householdno.toString() !== resident.householdno.toString()) {
            if (!empID) {
              const updated = await ChangeResident.create({
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
                HOAname,
                employmentstatus,
                occupation,
                monthlyincome,
                educationalattainment,
                typeofschool,
                course,
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
                isPregnant,
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
                head,
              });
              resident.changeID = updated._id;
              resident.status = "Change Requested";
            } else {
              // Employee override (non-head)
              const newHousehold = await Household.findById(householdno);
              if (newHousehold) {
                newHousehold.members.push({
                  resID: resident._id,
                  position: householdposition,
                });
                await newHousehold.save();
              }

              const oldHousehold = await Household.findById(
                resident.householdno
              );
              if (oldHousehold) {
                oldHousehold.members = oldHousehold.members.filter(
                  (m) => m.resID.toString() !== resident._id.toString()
                );
                await oldHousehold.save();
              }
              resident.householdno = householdno;
            }
          } else {
            let members = [...householdForm.members];
            // Resident becomes head in new household
            if (head === "Yes") {
              members.push({
                resID: resident._id,
                position: "Head",
              });
              const newhousehold = new Household({
                ...householdForm,
                members,
              });
              newhousehold.status = "Pending";
              await newhousehold.save();
              const updated = await ChangeResident.create({
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
                HOAname,
                employmentstatus,
                occupation,
                monthlyincome,
                educationalattainment,
                typeofschool,
                course,
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
                isPregnant,
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
                householdno: newhousehold._id,
                head,
              });
              resident.changeID = updated._id;
              resident.status = "Change Requested";
            } else {
              // Resident stays in the SAME household → only position changes
              if (!empID) {
                const updated = await ChangeResident.create({
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
                  HOAname,
                  employmentstatus,
                  occupation,
                  monthlyincome,
                  educationalattainment,
                  typeofschool,
                  course,
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
                  isPregnant,
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
                  head,
                });
                resident.changeID = updated._id;
                resident.status = "Change Requested";
              } else {
                // Employee override (directly update position)
                household.members = household.members.map((m) => {
                  if (m.resID.toString() === resident._id.toString()) {
                    return {
                      ...(m.toObject ? m.toObject() : m),
                      position: householdposition,
                    };
                  }
                  return m;
                });

                await household.save();
              }
            }
          }
        }
      }
    }

    await resident.save();

    if (empID) {
      await ActivityLog.insertOne({
        userID,
        action: "Update",
        target: "Residents",
        description: `User updated their resident profile.`,
      });
    } else {
      await ActivityLog.insertOne({
        userID,
        action: "Update",
        target: "Residents",
        description: `User requested a change to their resident profile.`,
      });
    }

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
