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

export async function loadDeletedAccountRecord(user) {
  if (!user?.email && !user?.id) return null;
  const normalizedEmail = user.email ? user.email.trim().toLowerCase() : null;

  if (user.email) {
    try {
      const deletedAccounts = await base44.entities.DeletedAccount.filter({ email: normalizedEmail });
      if (deletedAccounts?.length > 0) return deletedAccounts[0];
    } catch {}

    try {
      const deletedAccounts = await base44.entities.DeletedAccount.filter({ email: user.email });
      if (deletedAccounts?.length > 0) return deletedAccounts[0];
    } catch {}
  }

  if (user.id) {
    try {
      const deletedAccounts = await base44.entities.DeletedAccount.filter({ user_id: user.id });
      if (deletedAccounts?.length > 0) return deletedAccounts[0];
    } catch {}
  }

  return null;
}

export async function clearDeletedAccountRecord(user) {
  if (!user?.email && !user?.id) return;
  const recordsById = [];
  const normalizedEmail = user.email ? user.email.trim().toLowerCase() : null;

  if (normalizedEmail) {
    try {
      recordsById.push(...(await base44.entities.DeletedAccount.filter({ email: normalizedEmail }) || []));
    } catch {}
  }
  if (user.email && user.email !== normalizedEmail) {
    try {
      recordsById.push(...(await base44.entities.DeletedAccount.filter({ email: user.email }) || []));
    } catch {}
  }
  if (user.id) {
    try {
      recordsById.push(...(await base44.entities.DeletedAccount.filter({ user_id: user.id }) || []));
    } catch {}
  }

  const uniqueRecords = [...new Map(recordsById.map(record => [record.id, record])).values()];
  await Promise.all(uniqueRecords.map(record => base44.entities.DeletedAccount.delete(record.id).catch(() => {})));
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

function isApprovedMentorEntity(record) {
  return !isInactiveMentorRecord(record) && (
    record.is_approved === true ||
    record.application_status === "approved"
  );
}

function isActiveMentorApplication(record) {
  return !isInactiveMentorRecord(record);
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

  // If the auth token itself is marked deleted, trust it
  if (isDeletedAccount(currentUser)) return currentUser;

  // Check the DeletedAccount tombstone table
  const deletedAccount = await loadDeletedAccountRecord(currentUser);
  if (deletedAccount) {
    return {
      ...currentUser,
      isDeleted: true,
      is_deleted: true,
      deleted_at: deletedAccount.deleted_at || new Date().toISOString(),
    };
  }

  try {
    const userRecord = await base44.entities.User.get(currentUser.id);
    if (userRecord) {
      // The User entity row may be a stale tombstone from a prior account that
      // shared the same platform user ID (e.g. re-registered after hard delete).
      // If the row is marked deleted but the live auth token is NOT deleted,
      // treat it as a fresh/clean account and ignore the stale row.
      if (isDeletedAccount(userRecord) && !isDeletedAccount(currentUser)) {
        // Clear the stale row so it won't block again
        try { await base44.entities.User.delete(userRecord.id); } catch {}
        return null;
      }
      return userRecord;
    }
  } catch {
    // User entity row doesn't exist yet — that's fine for brand new accounts
  }

  // Do NOT fall back to email lookup — that could return a stale deleted row
  // from a previous account that happened to use the same email.
  return null;
}

export async function saveCurrentUserRecord(currentUser, fields, options = {}) {
  if (!currentUser?.id) throw new Error("Missing current user ID.");
  // Always clear any stale tombstone on fresh save — deletion now does a hard delete
  // so tombstones should not exist, but clear defensively just in case.
  const deletedAccountRecord = await loadDeletedAccountRecord(currentUser);
  if (deletedAccountRecord) await clearDeletedAccountRecord(currentUser);

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
  // Do NOT infer mentor from stale mentor_status/mentor_type — default to girl
  return ACCOUNT_TYPES.GIRL;
}

export function hasMentorAccount(userRecord) {
  if (!userRecord || isDeletedAccount(userRecord) || isInactiveMentorRecord(userRecord)) return false;
  // Only classify as mentor if account_type is explicitly set — never infer from
  // stale mentor_status/mentor_type fields alone, as these can be left over from
  // a rejected or pending application on a girl account.
  return (
    userRecord.account_type === ACCOUNT_TYPES.MENTOR ||
    userRecord.account_type === ACCOUNT_TYPES.LINKED
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
    const approvedMentor = mentors?.find(isApprovedMentorEntity);
    if (approvedMentor) return approvedMentor;
  } catch {}

  try {
    const teenMentors = await base44.entities.TeenMentor.filter({ user_email: email });
    const approvedTeenMentor = teenMentors?.find(isApprovedMentorEntity);
    if (approvedTeenMentor) return approvedTeenMentor;
  } catch {}

  return null;
}

export async function loadMentorApplicationByEmail(email) {
  if (!email) return null;

  const sortLatest = (records) => [...records].sort((a, b) => {
    const bDate = new Date(b.submitted_date || b.created_date || 0).getTime();
    const aDate = new Date(a.submitted_date || a.created_date || 0).getTime();
    return bDate - aDate;
  });

  try {
    const applications = await base44.entities.MentorApplication.filter({ user_email: email });
    const activeApplication = sortLatest(applications || []).find(isActiveMentorApplication);
    if (activeApplication) return activeApplication;
  } catch {}

  try {
    const teenApplications = await base44.entities.TeenMentorApplication.filter({ user_email: email });
    const activeTeenApplication = sortLatest(teenApplications || []).find(isActiveMentorApplication);
    if (activeTeenApplication) return activeTeenApplication;
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
    throw new Error("No account found. Please sign up to join the Sisterhood.");
  }

  // Admins bypass all role checks and go straight to dashboard
  if (userRecord.role === 'admin' || currentUser.role === 'admin') {
    return { user: currentUser, userRecord, route: '/dashboard' };
  }

  const storedAccountType = getAccountType(userRecord);
  const mentorEntity = await loadMentorEntityByEmail(currentUser.email);
  const mentorApplication = await loadMentorApplicationByEmail(currentUser.email);
  const hasDeletedMentorEntity = !mentorEntity && await hasDeletedMentorEntityByEmail(currentUser.email);
  if (hasDeletedMentorEntity && !mentorApplication && !userRecord.account_type) {
    await clearAuthSession();
    throw new Error("No account found. Please sign up to join the Sisterhood.");
  }
  // Only count as having mentor access if there's an APPROVED mentor entity.
  // A pending/rejected application alone does NOT grant mentor access.
  const hasMentorAccess = Boolean(mentorEntity);
  const accountType = storedAccountType === ACCOUNT_TYPES.LINKED
    ? ACCOUNT_TYPES.LINKED
    : (hasMentorAccess ? ACCOUNT_TYPES.MENTOR : (storedAccountType === ACCOUNT_TYPES.MENTOR ? ACCOUNT_TYPES.GIRL : storedAccountType));
  const isLinked = accountType === ACCOUNT_TYPES.LINKED;

  if (expectedAccountType === ACCOUNT_TYPES.MENTOR && accountType !== ACCOUNT_TYPES.MENTOR && !isLinked) {
    await clearAuthSession();
    throw new Error("This email is registered as a GGU app account. Please use the main app sign in.");
  }

  // Only block girl sign-in if there is an actual mentor entity or application.
  // If account_type was corrupted to "mentor" by the old onboarding flow but no
  // real mentor records exist, treat them as a girl account.
  if (expectedAccountType === ACCOUNT_TYPES.GIRL && accountType === ACCOUNT_TYPES.MENTOR && hasMentorAccess) {
    await clearAuthSession();
    throw new Error("This email is registered as a mentor account. Please use Mentor Sign In.");
  }

  if (accountType === ACCOUNT_TYPES.GIRL) {
    if (expectedAccountType === ACCOUNT_TYPES.MENTOR) {
      await clearAuthSession();
      throw new Error("This email is registered as a GGU app account. Please use the main app sign in.");
    }
  } else if (expectedAccountType === ACCOUNT_TYPES.MENTOR) {
    if (!mentorEntity && !mentorApplication) {
      await clearAuthSession();
      throw new Error("No active mentor account found with this email. Please apply to become a mentor.");
    }

    const storedMentorStatus = userRecord.mentor_status || currentUser.mentor_status;
    if (storedMentorStatus === "suspended") {
      await clearAuthSession();
      throw new Error("Your mentor account has been suspended. Please contact mentors@girlsglowingup.com");
    }

    const mentorStatus = (mentorEntity || mentorApplication.status === "approved") ? "approved" : "pending";
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

  // Self-heal: if account_type was corrupted to "mentor" but no real mentor records exist, fix it
  if (!hasMentorAccess && storedAccountType === ACCOUNT_TYPES.MENTOR) {
    await base44.auth.updateMe({ account_type: "girl" }).catch(() => {});
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

/**
 * Links a girl account to the currently-authenticated mentor account so both
 * share the same auth session with account_type "linked".
 *
 * Call this after signing in as a girl via Login.jsx when ?link=true is present.
 * The mentor session was already active; we just update both User entities and
 * the auth profile so isMentorModeActive / hasMentorAccount work correctly.
 */
export async function linkGirlAccountToMentor(girlUserRecord) {
  if (!girlUserRecord?.id) throw new Error("Missing girl user record.");

  await base44.auth.updateMe({
    account_type: ACCOUNT_TYPES.LINKED,
    active_mode: ACCOUNT_TYPES.GIRL,
  });

  try {
    await base44.entities.User.update(girlUserRecord.id, {
      account_type: ACCOUNT_TYPES.LINKED,
      active_mode: ACCOUNT_TYPES.GIRL,
    });
  } catch {
    // Non-fatal; auth profile update is the source of truth at login time.
  }
}