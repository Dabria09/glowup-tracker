import { base44 } from "@/api/base44Client";

export const ACCOUNT_TYPES = {
  GIRL: "girl",
  MENTOR: "mentor",
  LINKED: "linked",
};

export function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

export function getGirlAgeGroup(age) {
  if (age >= 10 && age <= 13) return "glow_girls";
  if (age >= 14 && age <= 18) return "glow_teens";
  if (age >= 19) return "glow_women";
  return null;
}

export function calculateGirlAgeGroup(dateOfBirth) {
  const age = calculateAge(dateOfBirth);
  return { age, ageGroup: age === null ? null : getGirlAgeGroup(age) };
}

export function getMentorTrack(age) {
  if (age >= 18) return "adult";
  if (age >= 13 && age <= 17) return "teen";
  return null;
}

const DELETED_ACCOUNT_STATUSES = new Set(["deleted", "removed"]);

export function isDeletedAccount(userRecord) {
  if (!userRecord) return false;
  const hasDeletedStatus = [
    userRecord.status,
    userRecord.account_status,
    userRecord.application_status,
    userRecord.mentor_status,
  ].some(status => status && DELETED_ACCOUNT_STATUSES.has(String(status).toLowerCase()));

  return userRecord.isDeleted === true ||
    userRecord.is_deleted === true ||
    Boolean(userRecord.deletedAt || userRecord.deleted_at) ||
    hasDeletedStatus;
}

const INACTIVE_MENTOR_STATUSES = new Set([
  "deleted",
  "removed",
  "archived",
  "inactive",
  "rejected",
]);

function isInactiveMentorRecord(record) {
  if (!record || isDeletedAccount(record) || record.is_active === false || record.active === false) {
    return true;
  }

  return [
    record.status,
    record.account_status,
    record.application_status,
    record.mentor_status,
  ].some(status => status && INACTIVE_MENTOR_STATUSES.has(String(status).toLowerCase()));
}

export async function clearAuthSession() {
  try {
    await base44.auth.logout();
  } catch {
    // The session may already be invalid after deletion.
  }
  localStorage.clear();
  sessionStorage.clear();
}

export async function loadCurrentUserRecord(currentUser) {
  if (!currentUser?.id) return null;

  try {
    const userRecord = await base44.entities.User.get(currentUser.id);
    return userRecord || currentUser;
  } catch {
    return currentUser;
  }
}

export async function saveCurrentUserRecord(currentUser, fields) {
  if (!currentUser?.id) throw new Error("Missing current user ID.");

  const payload = {
    id: currentUser.id,
    email: currentUser.email,
    ...fields,
  };

  const updatedUser = await base44.auth.updateMe(fields);

  try {
    return await base44.entities.User.update(currentUser.id, {
      email: currentUser.email,
      ...fields,
    });
  } catch (error) {
    try {
      return await base44.entities.User.create(payload);
    } catch (createError) {
      console.warn("User entity sync skipped after auth update:", createError || error);
      return updatedUser || { ...currentUser, ...fields };
    }
  }
}

async function loadUserProfile(email) {
  if (!email) return null;
  try {
    const profiles = await base44.entities.UserProfile.filter({ user_email: email });
    return profiles?.[0] || null;
  } catch {
    return null;
  }
}

async function syncGirlAgeMetadata(userRecord, currentUser) {
  const dateOfBirth = userRecord?.date_of_birth || currentUser?.date_of_birth;
  const { age, ageGroup } = calculateGirlAgeGroup(dateOfBirth);
  if (age === null || !ageGroup) {
    return {
      age: userRecord?.age ?? currentUser?.age ?? null,
      ageGroup: userRecord?.age_group || currentUser?.age_group || null,
      profile: await loadUserProfile(currentUser.email),
    };
  }

  const profile = await loadUserProfile(currentUser.email);
  const authNeedsUpdate = currentUser.age !== age || currentUser.age_group !== ageGroup;
  const profileNeedsUpdate = profile && (profile.age !== age || profile.age_group !== ageGroup || profile.date_of_birth !== dateOfBirth);

  await Promise.all([
    authNeedsUpdate ? base44.auth.updateMe({ age, age_group: ageGroup, date_of_birth: dateOfBirth }) : Promise.resolve(),
    profileNeedsUpdate ? base44.entities.UserProfile.update(profile.id, { age, age_group: ageGroup, date_of_birth: dateOfBirth }) : Promise.resolve(),
  ]);

  return { age, ageGroup, profile };
}

export function getAccountType(userRecord) {
  if (userRecord?.account_type) return userRecord.account_type;
  if (userRecord?.mentor_status || userRecord?.mentor_type) return ACCOUNT_TYPES.MENTOR;
  return ACCOUNT_TYPES.GIRL;
}

export function hasMentorAccount(userRecord) {
  if (!userRecord || isDeletedAccount(userRecord) || isInactiveMentorRecord(userRecord)) return false;
  return (
    userRecord.account_type === ACCOUNT_TYPES.MENTOR ||
    userRecord.account_type === ACCOUNT_TYPES.LINKED ||
    Boolean(userRecord.mentor_status || userRecord.mentor_type)
  );
}

export function isMentorModeActive(userRecord) {
  if (!userRecord) return false;
  if (userRecord.account_type === ACCOUNT_TYPES.LINKED) {
    return userRecord.active_mode === ACCOUNT_TYPES.MENTOR;
  }
  return hasMentorAccount(userRecord);
}

export async function loadMentorEntityByEmail(email) {
  if (!email) return null;

  try {
    const mentors = await base44.entities.Mentor.filter({ user_email: email });
    const activeMentor = mentors?.find(mentor => !isInactiveMentorRecord(mentor));
    if (activeMentor) return activeMentor;
  } catch {}

  try {
    const teenMentors = await base44.entities.TeenMentor.filter({ user_email: email });
    const activeTeenMentor = teenMentors?.find(mentor => !isInactiveMentorRecord(mentor));
    if (activeTeenMentor) return activeTeenMentor;
  } catch {}

  return null;
}

export async function hasDeletedMentorEntityByEmail(email) {
  if (!email) return false;

  try {
    const mentors = await base44.entities.Mentor.filter({ user_email: email });
    if (mentors?.some(mentor => isDeletedAccount(mentor))) return true;
  } catch {}

  try {
    const teenMentors = await base44.entities.TeenMentor.filter({ user_email: email });
    if (teenMentors?.some(mentor => isDeletedAccount(mentor))) return true;
  } catch {}

  return false;
}

export async function completeEmailPasswordSignIn({ email, password, expectedAccountType }) {
  await base44.auth.loginViaEmailPassword(email.trim(), password);

  const currentUser = await base44.auth.me();
  if (!currentUser) throw new Error("Failed to load user session.");

  const userRecord = await loadCurrentUserRecord(currentUser);
  if (!userRecord) {
    await clearAuthSession();
    throw new Error(expectedAccountType === ACCOUNT_TYPES.MENTOR
      ? "No mentor account found with this email. Please apply to become a mentor."
      : "No account found with this email. Please join the sisterhood to create an account.");
  }

  if (isDeletedAccount(userRecord)) {
    await clearAuthSession();
    throw new Error("This account has been deleted. Please create a new account.");
  }

  const storedAccountType = getAccountType(userRecord);
  const mentorEntity = await loadMentorEntityByEmail(currentUser.email);
  const hasDeletedMentorEntity = !mentorEntity && await hasDeletedMentorEntityByEmail(currentUser.email);
  if (hasDeletedMentorEntity && !userRecord.account_type) {
    await clearAuthSession();
    throw new Error("This account has been deleted. Please create a new account.");
  }
  const hasMentorAccess = hasMentorAccount(userRecord) || Boolean(mentorEntity);
  const accountType = storedAccountType === ACCOUNT_TYPES.LINKED
    ? ACCOUNT_TYPES.LINKED
    : (hasMentorAccess ? ACCOUNT_TYPES.MENTOR : storedAccountType);
  const isLinked = accountType === ACCOUNT_TYPES.LINKED;

  if (expectedAccountType === ACCOUNT_TYPES.MENTOR && accountType !== ACCOUNT_TYPES.MENTOR && !isLinked) {
    await clearAuthSession();
    throw new Error("This email is registered as a GGU app account. Please use the main app sign in.");
  }

  if (expectedAccountType === ACCOUNT_TYPES.GIRL && accountType === ACCOUNT_TYPES.MENTOR) {
    await clearAuthSession();
    throw new Error("This email is registered as a mentor account. Please use Mentor Sign In.");
  }

  if (accountType === ACCOUNT_TYPES.GIRL) {
    if (expectedAccountType === ACCOUNT_TYPES.MENTOR) {
      await clearAuthSession();
      throw new Error("This email is registered as a GGU app account. Please use the main app sign in.");
    }
  } else if (expectedAccountType === ACCOUNT_TYPES.MENTOR) {
    const mentorStatus = userRecord.mentor_status || currentUser.mentor_status || (mentorEntity?.is_approved === true ? "approved" : "pending");
    if (mentorStatus === "suspended") {
      await clearAuthSession();
      throw new Error("Your mentor account has been suspended. Please contact mentors@girlsglowingup.com");
    }
    if (isLinked && userRecord.active_mode !== "mentor") {
      await base44.auth.updateMe({ active_mode: "mentor" });
    }
    return {
      user: currentUser,
      userRecord,
      route: mentorStatus === "approved" ? "/mentor-dashboard" : "/mentor-dashboard?tab=Overview",
    };
  }

  if (isLinked && userRecord.active_mode !== "girl") {
    await base44.auth.updateMe({ active_mode: "girl" });
  }

  const { age, ageGroup, profile } = await syncGirlAgeMetadata(userRecord, currentUser);
  const requiresParentalConsent = (
    userRecord.requires_parental_consent === true ||
    profile?.parental_consent_sent === true ||
    (typeof age === "number" && age < 13)
  );
  const parentalConsentConfirmed = (
    userRecord.parental_consent_confirmed === true ||
    profile?.admin_consent_approved === true ||
    profile?.parental_consent_given === true
  );

  if (requiresParentalConsent && !parentalConsentConfirmed) {
    return {
      user: currentUser,
      userRecord,
      age,
      ageGroup,
      route: "/dashboard",
    };
  }

  return {
    user: currentUser,
    userRecord,
    age,
    ageGroup,
    route: "/dashboard",
  };
}
