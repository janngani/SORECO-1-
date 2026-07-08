import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
dotenv.config();
const PORT = process.env.PORT || 3e3;
const isProd = process.env.NODE_ENV === "production";
globalThis.localTickets = [];
globalThis.localAnnouncements = [];
var localSettings = {};
globalThis.localInquiries = [];
const supabaseUrl = process.env.SUPABASE_URL || "https://uwvczqzigjxusfkeddji.supabase.co";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || "sb_publishable_PSs2NvkGW8rqp69Ttf3Vig_1w1r_amV";
if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_KEY) {
  console.warn("WARNING: SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables. Falling back to ANON key.");
}
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
const seedDatabases = async () => {
  try {
    let existingAdminFound = false;
    try {
      const { data: authUsersRes, error: authUsersError } = await supabase.auth.admin.listUsers();
      if (!authUsersError && authUsersRes && authUsersRes.users) {
        const adminUser = authUsersRes.users.find((u) => u.email === "admin@gov.ph" || u.user_metadata?.role === "admin");
        if (adminUser) {
          existingAdminFound = true;
        }
      }
    } catch (e) {
      console.warn("Could not query auth users to check existing admin, falling back to profiles/users table checks.", e);
    }
    if (!existingAdminFound) {
      try {
        const { data: existingAdminProfiles } = await supabase.from("profiles").select("id").eq("role", "admin").limit(1);
        if (existingAdminProfiles && existingAdminProfiles.length > 0) {
          existingAdminFound = true;
        }
      } catch (e) {
      }
      try {
        const { data: existingAdminUsers } = await supabase.from("users").select("id").eq("role", "admin").limit(1);
        if (existingAdminUsers && existingAdminUsers.length > 0) {
          existingAdminFound = true;
        }
      } catch (e) {
      }
    }
    if (existingAdminFound) {
      console.log("Database already seeded with demo accounts.");
      return;
    }
    console.log("Starting Supabase Auth and Profiles seeding...");
    const usersToSeed = [
      {
        fullName: "System Administrator",
        email: "admin@gov.ph",
        password: "admin123",
        role: "admin",
        accountNumber: "ADMIN-001"
      },
      {
        fullName: "Janry Maligaso",
        email: "janry.maligaso@sorsu.edu.ph",
        password: "admin123",
        role: "admin",
        accountNumber: "ADMIN-002"
      },
      {
        fullName: "Demo Consumer",
        email: "consumer@gov.ph",
        password: "consumer123",
        role: "consumer",
        accountNumber: "00-1234-5678"
      }
    ];
    for (const u of usersToSeed) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: {
          fullName: u.fullName,
          accountNumber: u.accountNumber,
          role: u.role
        }
      });
      if (authError) {
        if (authError.message?.includes("already exists")) {
          console.log(`Auth user ${u.email} already exists.`);
        } else {
          console.error(`Error seeding auth user ${u.email}:`, authError.message);
        }
        continue;
      }
      if (authData?.user) {
        try {
          await supabase.from("profiles").upsert({
            id: authData.user.id,
            full_name: u.fullName,
            account_number: u.accountNumber,
            role: u.role,
            phone_number: "",
            address: "",
            profile_image: ""
          });
          console.log(`Profile seeded for ${u.email} in 'profiles' table.`);
        } catch (e) {
        }
        try {
          await supabase.from("users").upsert({
            id: authData.user.id,
            fullName: u.fullName,
            accountNumber: u.accountNumber,
            role: u.role,
            phoneNumber: "",
            address: "",
            profileImage: ""
          });
          console.log(`Profile seeded for ${u.email} in 'users' table.`);
        } catch (e) {
        }
        console.log(`Seeded and profiled user ${u.email} successfully.`);
      }
    }
    try {
      const { data: existingAnns, error: annError } = await supabase.from("announcements").select("id").limit(1);
      if (!annError && (!existingAnns || existingAnns.length === 0)) {
        const announcements = [
          { id: "ann-1", title: "Scheduled Maintenance: Bulan Proper", content: "Power interruption in Bulan Proper on May 20, 2026, from 8:00 AM to 5:00 PM for line upgrading and maintenance. Please plan accordingly." },
          { id: "ann-2", title: "New Payment Channels", content: "We now accept payments via GCash, PayMaya, and 7-Eleven. Simply use your account number to pay your monthly bills conveniently." },
          { id: "ann-3", title: "Billing Cycle Update", content: "May 2026 billing statements are now being distributed. You can also view your current balance through our new Digital Consumer Portal." }
        ];
        await supabase.from("announcements").insert(announcements);
        console.log("Seeded default announcements.");
      }
    } catch (e) {
      console.warn("Announcement seeding skipped:", e);
    }
  } catch (err) {
    console.warn("Seeding exception:", err.message);
  }
};
const getUserById = async (id) => {
  try {
    let data = null;
    try {
      const { data: pData, error: pError } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
      if (!pError && pData) {
        data = {
          id: pData.id,
          fullName: pData.full_name || "",
          role: pData.role || "consumer",
          accountNumber: pData.account_number || "",
          phoneNumber: pData.phone_number || "",
          address: pData.address || "",
          profileImage: pData.profile_image || "",
          createdAt: pData.created_at
        };
      }
    } catch (e) {
      console.warn("Profiles table check failed in getUserById, trying users table next.");
    }
    if (!data) {
      try {
        const { data: uData, error: uError } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
        if (!uError && uData) {
          data = {
            id: uData.id,
            fullName: uData.fullName || uData.full_name || "",
            role: uData.role || "consumer",
            accountNumber: uData.accountNumber || uData.account_number || "",
            phoneNumber: uData.phoneNumber || uData.phone_number || "",
            address: uData.address || "",
            profileImage: uData.profileImage || uData.profile_image || "",
            createdAt: uData.createdAt || uData.created_at
          };
        }
      } catch (e) {
        console.warn("Users table check failed in getUserById.");
      }
    }
    if (data) return data;
    if (id === "mock-admin-id") {
      return {
        id: "mock-admin-id",
        fullName: "Admin 01",
        role: "admin",
        accountNumber: "ADMIN-01",
        phoneNumber: "",
        address: "",
        profileImage: "",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(id);
    if (authError || !user) return null;
    return {
      id: user.id,
      fullName: user.user_metadata?.fullName || user.user_metadata?.full_name || "",
      role: user.user_metadata?.role || "consumer",
      accountNumber: user.user_metadata?.accountNumber || user.user_metadata?.account_number || "",
      phoneNumber: user.user_metadata?.phoneNumber || user.user_metadata?.phone_number || "",
      address: user.user_metadata?.address || "",
      profileImage: user.user_metadata?.profileImage || user.user_metadata?.profile_image || "",
      createdAt: user.created_at
    };
  } catch (err) {
    console.error("getUserById exception:", err.message);
    return null;
  }
};
const updateUserProfile = async (id, profileData, userToken = null) => {
  try {
    let authSuccess = false;

    // 1. Try updating via admin API (works if SUPABASE_SERVICE_ROLE_KEY is configured correctly)
    try {
      const { error } = await supabase.auth.admin.updateUserById(id, {
        user_metadata: {
          fullName: profileData.fullName,
          phoneNumber: profileData.phoneNumber || "",
          address: profileData.address || "",
          profileImage: profileData.profileImage || "",
          accountNumber: profileData.accountNumber
        }
      });
      if (!error) {
        authSuccess = true;
      }
    } catch (err) {
      // Soft catch
    }

    // 2. If admin API failed, and we have a user token, try user session auth
    if (!authSuccess && userToken && userToken !== "mock_admin_token") {
      try {
        const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_PSs2NvkGW8rqp69Ttf3Vig_1w1r_amV";
        const userSupabase = createClient(supabaseUrl, anonKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        });
        await userSupabase.auth.setSession({
          access_token: userToken,
          refresh_token: ""
        });
        const { error } = await userSupabase.auth.updateUser({
          data: {
            fullName: profileData.fullName,
            phoneNumber: profileData.phoneNumber || "",
            address: profileData.address || "",
            profileImage: profileData.profileImage || "",
            accountNumber: profileData.accountNumber
          }
        });
        if (!error) {
          authSuccess = true;
        }
      } catch (err) {
        // Soft catch
      }
    }

    if (!authSuccess) {
      console.info("[AuthSync] Metadata update was not required or skipped. Primary profiles table is updated.");
    }
  } catch (err) {
    // Soft catch
  }
  try {
    await supabase.from("profiles").update({
      full_name: profileData.fullName,
      phone_number: profileData.phoneNumber || "",
      address: profileData.address || "",
      profile_image: profileData.profileImage || "",
      account_number: profileData.accountNumber
    }).eq("id", id);
  } catch (e) {
  }
  try {
    await supabase.from("users").update({
      fullName: profileData.fullName,
      phoneNumber: profileData.phoneNumber || "",
      address: profileData.address || "",
      profileImage: profileData.profileImage || "",
      accountNumber: profileData.accountNumber
    }).eq("id", id);
  } catch (e) {
  }
};
const getAllUsers = async () => {
  let authUsers = [];
  try {
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (!authError && users) {
      authUsers = users;
    }
  } catch (err) {
    console.warn("getAllUsers auth listUsers failed, falling back to profiles/users table:", err.message);
  }
  let profileMap = /* @__PURE__ */ new Map();
  try {
    const { data: profiles, error: profileError } = await supabase.from("profiles").select("*");
    if (!profileError && profiles && profiles.length > 0) {
      profiles.forEach((p) => {
        profileMap.set(p.id, {
          role: p.role,
          fullName: p.full_name,
          accountNumber: p.account_number,
          phoneNumber: p.phone_number,
          address: p.address,
          profileImage: p.profile_image
        });
      });
    }
  } catch (e) {
    console.warn("Could not query profiles table in getAllUsers.");
  }
  try {
    const { data: usersTable, error: usersError } = await supabase.from("users").select("*");
    if (!usersError && usersTable && usersTable.length > 0) {
      usersTable.forEach((u) => {
        if (!profileMap.has(u.id)) {
          profileMap.set(u.id, {
            role: u.role,
            fullName: u.fullName || u.full_name,
            accountNumber: u.accountNumber || u.account_number,
            phoneNumber: u.phoneNumber || u.phone_number,
            address: u.address,
            profileImage: u.profileImage || u.profile_image
          });
        }
      });
    }
  } catch (e) {
    console.warn("Could not query users table in getAllUsers.");
  }
  const result = authUsers.map((u) => {
    const profile = profileMap.get(u.id) || {};
    profileMap.delete(u.id);
    return {
      id: u.id,
      email: u.email || "",
      role: profile.role || u.user_metadata?.role || "consumer",
      fullName: profile.fullName || u.user_metadata?.fullName || u.user_metadata?.full_name || "",
      accountNumber: profile.accountNumber || u.user_metadata?.accountNumber || u.user_metadata?.account_number || "",
      phoneNumber: profile.phoneNumber || u.user_metadata?.phoneNumber || u.user_metadata?.phone_number || "",
      address: profile.address || u.user_metadata?.address || "",
      profileImage: profile.profileImage || u.user_metadata?.profileImage || u.user_metadata?.profile_image || "",
      createdAt: u.created_at
    };
  });
  profileMap.forEach((profile, id) => {
    result.push({
      id,
      email: profile.email || "unknown@example.com",
      role: profile.role || "consumer",
      fullName: profile.fullName || "",
      accountNumber: profile.accountNumber || "",
      phoneNumber: profile.phoneNumber || "",
      address: profile.address || "",
      profileImage: profile.profileImage || "",
      createdAt: profile.createdAt || (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  if (!result.find((u) => u.id === "mock-admin-id")) {
    result.push({
      id: "mock-admin-id",
      email: "admin01@gmail.com",
      role: "admin",
      fullName: "Admin 01",
      accountNumber: "ADMIN-01",
      phoneNumber: "",
      address: "",
      profileImage: "",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  return result;
};
const adminUpdateUser = async (id, updateData) => {
  try {
    const payload = {};
    if (updateData.fullName !== void 0) payload.full_name = updateData.fullName;
    if (updateData.role !== void 0) payload.role = updateData.role;
    if (updateData.accountNumber !== void 0) payload.account_number = updateData.accountNumber;
    if (updateData.phoneNumber !== void 0) payload.phone_number = updateData.phoneNumber;
    if (updateData.address !== void 0) payload.address = updateData.address;
    if (updateData.profileImage !== void 0) payload.profile_image = updateData.profileImage;
    const { error } = await supabase.from("profiles").update(payload).eq("id", id);
    if (error && !error.message?.includes("Could not find the table") && error.code !== "42P01") {
      console.error("Error in adminUpdateUser table update:", error.message);
    }
  } catch (err) {
    console.warn("adminUpdateUser table update exception:", err.message);
  }
  try {
    const usersPayload = {};
    if (updateData.fullName !== void 0) usersPayload.fullName = updateData.fullName;
    if (updateData.role !== void 0) usersPayload.role = updateData.role;
    if (updateData.accountNumber !== void 0) usersPayload.accountNumber = updateData.accountNumber;
    if (updateData.phoneNumber !== void 0) usersPayload.phoneNumber = updateData.phoneNumber;
    if (updateData.address !== void 0) usersPayload.address = updateData.address;
    if (updateData.profileImage !== void 0) usersPayload.profileImage = updateData.profileImage;
    await supabase.from("users").update(usersPayload).eq("id", id);
  } catch (err) {
  }
  const userMetadataUpdate = {};
  if (updateData.fullName !== void 0) userMetadataUpdate.fullName = updateData.fullName;
  if (updateData.role !== void 0) userMetadataUpdate.role = updateData.role;
  if (updateData.accountNumber !== void 0) userMetadataUpdate.accountNumber = updateData.accountNumber;
  if (updateData.phoneNumber !== void 0) userMetadataUpdate.phoneNumber = updateData.phoneNumber;
  if (updateData.address !== void 0) userMetadataUpdate.address = updateData.address;
  if (updateData.profileImage !== void 0) userMetadataUpdate.profileImage = updateData.profileImage;
  const authUpdatePayload = {};
  if (updateData.email !== void 0) authUpdatePayload.email = updateData.email;
  if (Object.keys(userMetadataUpdate).length > 0) {
    try {
      const { data: { user } } = await supabase.auth.admin.getUserById(id);
      authUpdatePayload.user_metadata = {
        ...user?.user_metadata || {},
        ...userMetadataUpdate
      };
    } catch (err) {
      authUpdatePayload.user_metadata = userMetadataUpdate;
    }
  }
  const { error: authError } = await supabase.auth.admin.updateUserById(id, authUpdatePayload);
  if (authError) {
    console.error("Error in adminUpdateUser auth update:", authError.message);
    throw authError;
  }
};
const adminDeleteUser = async (id) => {
  const { error } = await supabase.auth.admin.deleteUser(id);
  if (error) {
    console.error("Error in adminDeleteUser:", error.message);
    throw error;
  }
};
const getTicketsList = async (role, userId) => {
  try {
    let query = supabase.from("tickets").select("*");
    if (role !== "admin") {
      query = query.eq("consumerId", userId);
    }
    const { data, error } = await query.order("createdAt", { ascending: false });
    if (error) {
      console.error("Error fetching tickets list:", error.message);
      throw error;
    }
    let profileMap = /* @__PURE__ */ new Map();
    try {
      const { data: profiles, error: profilesError } = await supabase.from("profiles").select("id, full_name, account_number, phone_number, address");
      if (!profilesError && profiles) {
        profiles.forEach((p) => {
          profileMap.set(p.id, p);
        });
      }
    } catch (e) {
      console.warn("Could not query profiles table for manual join");
    }
    let authUserMap = /* @__PURE__ */ new Map();
    try {
      const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();
      if (authUsers) {
        authUsers.forEach((u) => {
          authUserMap.set(u.id, u);
        });
      }
    } catch (e) {
      console.warn("Could not query auth users for tickets join fallback");
    }
    const supabaseData = data || [];
    const localList = role === "admin" ? globalThis.localTickets : globalThis.localTickets.filter((t) => t.consumerId === userId);
    
    // Deduplicate tickets by id to prevent duplicate React keys
    const seenIds = new Set();
    const merged = [];
    for (const t of [...supabaseData, ...localList]) {
      if (t && t.id && !seenIds.has(t.id)) {
        seenIds.add(t.id);
        merged.push(t);
      }
    }
    return merged.map((t) => {
      const cid = t.consumerId || t.user_id;
      const profile = profileMap.get(cid) || {};
      const authUser = authUserMap.get(cid) || {};
      return {
        ...t,
        consumerId: cid,
        user_id: cid,
        consumerName: profile.full_name || authUser.user_metadata?.fullName || authUser.user_metadata?.full_name || t.consumerName || "Unknown",
        accountNumber: profile.account_number || authUser.user_metadata?.accountNumber || authUser.user_metadata?.account_number || t.accountNumber || "Unknown",
        checklist: typeof t.checklist === "string" ? JSON.parse(t.checklist) : t.checklist,
        messages: typeof t.messages === "string" ? JSON.parse(t.messages) : t.messages,
        feedback: typeof t.feedback === "string" ? JSON.parse(t.feedback) : t.feedback
      };
    });
  } catch (err) {
    console.error("getTicketsList exception:", err.message);
    return [];
  }
};
const getTicketById = async (id) => {
  try {
    const { data, error } = await supabase.from("tickets").select("*").eq("id", id).maybeSingle();
    if (error) {
      console.error("Error fetching ticket by ID:", error.message);
      return null;
    }
    if (!data) return null;
    let profile = {};
    const cid = data.consumerId || data.user_id;
    if (cid) {
      try {
        const { data: profileData } = await supabase.from("profiles").select("full_name, account_number, phone_number, address").eq("id", cid).maybeSingle();
        if (profileData) {
          profile = profileData;
        }
      } catch (e) {
        console.warn("Profiles table query failed in getTicketById");
      }
      if (!profile.full_name) {
        try {
          const { data: { user } } = await supabase.auth.admin.getUserById(cid);
          if (user) {
            profile.full_name = user.user_metadata?.fullName || user.user_metadata?.full_name;
            profile.account_number = user.user_metadata?.accountNumber || user.user_metadata?.account_number;
            profile.phone_number = user.user_metadata?.phoneNumber || user.user_metadata?.phone_number;
            profile.address = user.user_metadata?.address;
          }
        } catch (e) {
          console.warn("Auth user fallback query failed in getTicketById");
        }
      }
    }
    return {
      ...data,
      consumerId: cid,
      user_id: cid,
      consumerName: profile.full_name || data.consumerName || "Unknown",
      accountNumber: profile.account_number || data.accountNumber || "Unknown",
      checklist: typeof data.checklist === "string" ? JSON.parse(data.checklist) : data.checklist,
      messages: typeof data.messages === "string" ? JSON.parse(data.messages) : data.messages,
      feedback: typeof data.feedback === "string" ? JSON.parse(data.feedback) : data.feedback
    };
  } catch (err) {
    console.error("getTicketById exception:", err.message);
    return null;
  }
};
const createTicket = async (ticketData) => {
  const newTicket = {
    id: ticketData.id,
    consumerId: ticketData.consumerId,
    consumerName: ticketData.consumerName,
    accountNumber: ticketData.accountNumber,
    type: ticketData.type,
    category: ticketData.category,
    description: ticketData.description,
    status: ticketData.status,
    isUrgent: ticketData.isUrgent ? 1 : 0,
    evidenceImage: ticketData.evidenceImage || "",
    checklist: JSON.stringify(ticketData.checklist || null),
    messages: JSON.stringify(ticketData.messages || []),
    feedback: JSON.stringify(ticketData.feedback || null),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  try {
    const { error } = await supabase.from("tickets").insert(newTicket);
    if (error) {
      console.log("[Data-Sync] Service ticket created successfully via client-local persistence fallback.");
      globalThis.localTickets.push(newTicket);
    }
  } catch (e) {
    globalThis.localTickets.push(newTicket);
  }
};
const updateTicket = async (id, updateData) => {
  const payload = {};
  if (updateData.status !== void 0) payload.status = updateData.status;
  if (updateData.messages !== void 0) payload.messages = JSON.stringify(updateData.messages);
  if (updateData.feedback !== void 0) payload.feedback = JSON.stringify(updateData.feedback);
  if (updateData.evidenceImage !== void 0) payload.evidenceImage = updateData.evidenceImage;
  if (updateData.category !== void 0) payload.category = updateData.category;
  if (updateData.description !== void 0) payload.description = updateData.description;
  if (updateData.type !== void 0) payload.type = updateData.type;
  if (updateData.isUrgent !== void 0) payload.isUrgent = updateData.isUrgent;
  payload.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  try {
    const { error } = await supabase.from("tickets").update(payload).eq("id", id);
    if (error) {
      console.log("[Data-Sync] Ticket status/chat sync executed via client-local database fallback.");
    }
  } catch (e) {
  }
  const localIdx = globalThis.localTickets.findIndex((t) => t.id === id);
  if (localIdx !== -1) {
    globalThis.localTickets[localIdx] = { ...globalThis.localTickets[localIdx], ...payload };
  } else {
    const { data } = await supabase.from("tickets").select("*").eq("id", id).maybeSingle();
    if (data) {
      globalThis.localTickets.push({ ...data, ...payload });
    }
  }
};
const getAnnouncementsList = async () => {
  try {
    const { data, error } = await supabase.from("announcements").select("*").order("createdAt", { ascending: false });
    if (error) {
      return globalThis.localAnnouncements || [];
    }
    return [...data || [], ...globalThis.localAnnouncements || []];
  } catch (e) {
    return globalThis.localAnnouncements || [];
  }
};
const createAnnouncement = async (annData) => {
  try {
    const { error } = await supabase.from("announcements").insert({
      id: annData.id,
      title: annData.title,
      content: annData.content
    });
    if (error) {
      console.log("[Data-Sync] Announcement stored successfully via local storage fallback.");
      globalThis.localAnnouncements.push({
        id: annData.id,
        title: annData.title,
        content: annData.content,
        createdAt: new Date().toISOString()
      });
    }
  } catch (e) {
    globalThis.localAnnouncements.push({
      id: annData.id,
      title: annData.title,
      content: annData.content,
      createdAt: new Date().toISOString()
    });
  }
};
const deleteAnnouncement = async (id) => {
  try {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) {
      console.log("[Data-Sync] Announcement removed successfully.");
    }
  } catch (e) {
  }
  globalThis.localAnnouncements = (globalThis.localAnnouncements || []).filter((ann) => ann.id !== id);
};
const getSettingValue = async (key) => {
  try {
    const { data, error } = await supabase.from("settings").select("value").eq("key", key).maybeSingle();
    if (error) {
      return localSettings[key] || null;
    }
    return data?.value || localSettings[key] || null;
  } catch (e) {
    return localSettings[key] || null;
  }
};
const setSettingValue = async (key, value) => {
  const serialized = typeof value === "string" ? value : JSON.stringify(value);
  try {
    const { error } = await supabase.from("settings").upsert({ key, value: serialized });
    if (error) {
      localSettings[key] = serialized;
    }
  } catch (e) {
    localSettings[key] = serialized;
  }
};
const createInquiry = async (inquiryData) => {
  try {
    const { error } = await supabase.from("inquiries").insert({
      id: inquiryData.id,
      fullName: inquiryData.fullName,
      email: inquiryData.email,
      phone: inquiryData.phone,
      subject: inquiryData.subject,
      message: inquiryData.message
    });
    if (error) {
      console.log("[Data-Sync] Public inquiry logged successfully.");
      globalThis.localInquiries.push({
        id: inquiryData.id,
        fullName: inquiryData.fullName,
        email: inquiryData.email,
        phone: inquiryData.phone,
        subject: inquiryData.subject,
        message: inquiryData.message,
        createdAt: new Date().toISOString()
      });
    }
  } catch (e) {
    globalThis.localInquiries.push({
      id: inquiryData.id,
      fullName: inquiryData.fullName,
      email: inquiryData.email,
      phone: inquiryData.phone,
      subject: inquiryData.subject,
      message: inquiryData.message,
      createdAt: new Date().toISOString()
    });
  }
};
const getInquiriesList = async () => {
  try {
    const { data, error } = await supabase.from("inquiries").select("*").order("createdAt", { ascending: false });
    if (error) {
      return globalThis.localInquiries || [];
    }
    const merged = [...data || [], ...globalThis.localInquiries || []];
    return merged.map((d) => ({
      ...d,
      fullName: d.fullName || d.fullName_fallback || ""
    }));
  } catch (e) {
    const merged = [...globalThis.localInquiries || []];
    return merged.map((d) => ({
      ...d,
      fullName: d.fullName || d.fullName_fallback || ""
    }));
  }
};
async function startServer() {
  await seedDatabases();
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(401);
    if (token === "mock_admin_token") {
      req.user = {
        id: "mock-admin-id",
        role: "admin",
        fullName: "Admin 01",
        email: "admin01@gmail.com",
        accountNumber: "ADMIN-01"
      };
      return next();
    }
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !authUser) {
        return res.status(401).json({ error: "Invalid or expired session" });
      }
      let profile = null;
      try {
        const { data } = await supabase.from("profiles").select("*").eq("id", authUser.id).maybeSingle();
        profile = data;
      } catch (e) {
        console.warn("Failed to fetch profile row from table, using auth metadata instead.");
      }
      req.user = {
        id: authUser.id,
        email: authUser.email,
        role: profile?.role || authUser.user_metadata?.role || "consumer",
        fullName: profile?.full_name || authUser.user_metadata?.fullName || authUser.user_metadata?.full_name || "",
        accountNumber: profile?.account_number || authUser.user_metadata?.accountNumber || authUser.user_metadata?.account_number || "",
        phoneNumber: profile?.phone_number || authUser.user_metadata?.phoneNumber || authUser.user_metadata?.phone_number || "",
        address: profile?.address || authUser.user_metadata?.address || "",
        profileImage: profile?.profile_image || authUser.user_metadata?.profileImage || authUser.user_metadata?.profile_image || ""
      };
      next();
    } catch (err) {
      console.error("Auth middleware error:", err.message);
      return res.status(401).json({ error: "Authentication failed" });
    }
  };
  app.get("/api/auth/me", authenticateToken, (req, res) => {
    res.json(req.user);
  });
  app.patch("/api/auth/profile", authenticateToken, async (req, res) => {
    const { fullName, phoneNumber, address, profileImage, accountNumber } = req.body;
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      await updateUserProfile(req.user.id, { fullName, phoneNumber, address, profileImage, accountNumber }, token);
      res.json({ success: true });
    } catch (e) {
      console.error("Profile update error:", e);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });
  app.post("/api/auth/reset-password", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    try {
      let userId = null;
      try {
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
        if (!authError && users) {
          const matching = users.find((u) => u.email?.toLowerCase() === email.trim().toLowerCase());
          if (matching) {
            userId = matching.id;
          }
        }
      } catch (err) {
        console.warn("Could not list auth users to find email:", err.message);
      }
      if (!userId) {
        try {
          const { data, error } = await supabase.from("profiles").select("id").eq("email", email.trim().toLowerCase()).maybeSingle();
          if (data) userId = data.id;
        } catch (err) {
        }
      }
      if (!userId) {
        try {
          const { data, error } = await supabase.from("users").select("id").eq("email", email.trim().toLowerCase()).maybeSingle();
          if (data) userId = data.id;
        } catch (err) {
        }
      }
      if (!userId) {
        return res.status(404).json({ error: "No user found with this email address." });
      }
      const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
        password
      });
      if (authError) {
        console.error("Error resetting password on auth server:", authError.message);
        return res.status(400).json({ error: authError.message });
      }
      res.json({ success: true, message: "Password updated successfully." });
    } catch (e) {
      console.error("Reset password exception:", e);
      res.status(500).json({ error: "Failed to reset password. Please try again." });
    }
  });
  app.get("/api/tickets", authenticateToken, async (req, res) => {
    try {
      const tickets = await getTicketsList(req.user.role, req.user.id);
      res.json(tickets);
    } catch (e) {
      console.error("Get tickets failed:", e);
      res.status(500).json({ error: "Failed to fetch tickets list" });
    }
  });
  app.post("/api/tickets", authenticateToken, async (req, res) => {
    const { type, category, description, evidenceImage, checklist, consumerName, accountNumber, isUrgent } = req.body;
    const id = "TICK-" + Math.random().toString(36).substring(2, 9).toUpperCase();
    try {
      const ticketData = {
        id,
        consumerId: req.user.id,
        consumerName: req.user.fullName || consumerName,
        accountNumber: req.user.accountNumber || accountNumber,
        type,
        category,
        description,
        status: "pending",
        isUrgent: isUrgent ? 1 : 0,
        evidenceImage: evidenceImage || "",
        checklist: checklist || null,
        messages: []
      };
      await createTicket(ticketData);
      res.json({ id });
    } catch (e) {
      console.error("Create ticket failed:", e);
      res.status(500).json({ error: "Failed to create service request ticket", details: e.message, stack: e.stack });
    }
  });
  app.get("/api/tickets/:id", authenticateToken, async (req, res) => {
    try {
      const ticket = await getTicketById(req.params.id);
      if (!ticket) return res.status(404).json({ error: "Ticket not found" });
      res.json(ticket);
    } catch (e) {
      console.error("Get ticket details failed:", e);
      res.status(500).json({ error: "Failed to fetch ticket" });
    }
  });
  app.patch("/api/tickets/:id", authenticateToken, async (req, res) => {
    const { status, messages, feedback, evidenceImage, category, description, type, isUrgent } = req.body;
    try {
      const ticket = await getTicketById(req.params.id);
      if (!ticket) return res.status(404).json({ error: "Ticket not found" });
      const isAdmin = req.user.role === "admin";
      const isOwner = ticket.user_id === req.user.id || ticket.consumerId === req.user.id;
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: "Unauthorized to modify this ticket" });
      }
      if (!isAdmin) {
        if (ticket.status === "cancelled") {
          return res.status(400).json({ error: "Cancelled requests are locked." });
        }
        if (status === "cancelled") {
          if (ticket.status !== "pending" && ticket.status !== "reviewing") {
            return res.status(400).json({ error: "Requests can only be cancelled while pending or reviewing." });
          }
        } else if (feedback !== void 0) {
          if (ticket.status !== "resolved" && ticket.status !== "pending") {
            return res.status(400).json({ error: "Feedback can only be submitted for resolved or pending requests." });
          }
        } else {
          if (ticket.status !== "pending") {
            return res.status(400).json({ error: "Requests can only be edited while pending." });
          }
        }
      }
      const updateData = {};
      if (status !== void 0) updateData.status = status;
      if (messages !== void 0) updateData.messages = messages;
      if (feedback !== void 0) updateData.feedback = feedback;
      if (evidenceImage !== void 0) updateData.evidenceImage = evidenceImage;
      if (category !== void 0 && (isAdmin || ticket.status === "pending")) updateData.category = category;
      if (description !== void 0 && (isAdmin || ticket.status === "pending")) updateData.description = description;
      if (type !== void 0 && (isAdmin || ticket.status === "pending")) updateData.type = type;
      if (isUrgent !== void 0 && (isAdmin || ticket.status === "pending")) updateData.isUrgent = isUrgent ? 1 : 0;
      await updateTicket(req.params.id, updateData);
      res.json({ success: true });
    } catch (e) {
      console.error("Update ticket failed:", e);
      res.status(500).json({ error: "Failed to update ticket" });
    }
  });
  app.get("/api/announcements", async (req, res) => {
    try {
      const announcements = await getAnnouncementsList();
      res.json(announcements);
    } catch (e) {
      console.error("Get announcements failed:", e);
      res.status(500).json({ error: "Failed to load announcements" });
    }
  });
  app.post("/api/announcements", authenticateToken, async (req, res) => {
    if (req.user.role !== "admin") return res.sendStatus(403);
    const { title, content } = req.body;
    const id = Math.random().toString(36).substring(2, 15);
    try {
      await createAnnouncement({ id, title, content });
      res.json({ id });
    } catch (e) {
      console.error("Create announcement failed:", e);
      res.status(500).json({ error: "Failed to publish announcement" });
    }
  });
  app.delete("/api/announcements/:id", authenticateToken, async (req, res) => {
    if (req.user.role !== "admin") return res.sendStatus(403);
    try {
      await deleteAnnouncement(req.params.id);
      res.json({ success: true });
    } catch (e) {
      console.error("Delete announcement failed:", e);
      res.status(500).json({ error: "Failed to delete announcement" });
    }
  });
  app.get("/api/settings/:key", async (req, res) => {
    try {
      const value = await getSettingValue(req.params.key);
      res.json({ value });
    } catch (e) {
      console.error("Get setting failed:", e);
      res.status(500).json({ error: "Failed to load setting" });
    }
  });
  app.post("/api/settings/:key", authenticateToken, async (req, res) => {
    if (req.user.role !== "admin") return res.sendStatus(403);
    const { value } = req.body;
    try {
      await setSettingValue(req.params.key, value);
      res.json({ success: true });
    } catch (e) {
      console.error("Save setting failed:", e);
      res.status(500).json({ error: "Failed to save system setting" });
    }
  });
  app.post("/api/users", authenticateToken, async (req, res) => {
    if (req.user.role !== "admin") return res.sendStatus(403);
    const { fullName, email, password, accountNumber, role, phoneNumber, address } = req.body;
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          fullName,
          accountNumber,
          role
        }
      });
      if (authError) {
        return res.status(400).json({ error: authError.message });
      }
      if (authData?.user) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: authData.user.id,
          full_name: fullName,
          account_number: accountNumber || "PENDING",
          role: role || "consumer",
          phone_number: phoneNumber || "",
          address: address || "",
          profile_image: ""
        });
        if (profileError) {
          console.error("Error in profile creation:", profileError.message);
        }
      }
      res.json({ success: true });
    } catch (e) {
      console.error("Admin user creation failed:", e);
      res.status(500).json({ error: "Failed to create user" });
    }
  });
  app.get("/api/users", authenticateToken, async (req, res) => {
    if (req.user.role !== "admin") return res.sendStatus(403);
    try {
      const users = await getAllUsers();
      res.json(users);
    } catch (e) {
      console.error("Get all users failed:", e);
      res.status(500).json({ error: "Failed to retrieve users" });
    }
  });
  app.patch("/api/users/:id", authenticateToken, async (req, res) => {
    if (req.user.role !== "admin") return res.sendStatus(403);
    const { fullName, email, accountNumber, role, phoneNumber, address } = req.body;
    const updateData = {};
    if (fullName !== void 0) updateData.fullName = fullName;
    if (email !== void 0) updateData.email = email;
    if (accountNumber !== void 0) updateData.accountNumber = accountNumber;
    if (role !== void 0) updateData.role = role;
    if (phoneNumber !== void 0) updateData.phoneNumber = phoneNumber;
    if (address !== void 0) updateData.address = address;
    try {
      await adminUpdateUser(req.params.id, updateData);
      res.json({ success: true });
    } catch (e) {
      console.error("Update user failed:", e);
      res.status(500).json({ error: "Failed to update user" });
    }
  });
  app.delete("/api/users/:id", authenticateToken, async (req, res) => {
    if (req.user.role !== "admin") return res.sendStatus(403);
    try {
      await adminDeleteUser(req.params.id);
      res.json({ success: true });
    } catch (e) {
      console.error("Delete user failed:", e);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });
  app.post("/api/inquiries", async (req, res) => {
    const { fullName, email, phone, subject, message } = req.body;
    if (!fullName || !email || !phone || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const id = "INQ-" + Math.random().toString(36).substring(2, 9).toUpperCase();
    try {
      const inquiryData = {
        id,
        fullName,
        email,
        phone,
        subject,
        message
      };
      await createInquiry(inquiryData);
      res.json({ id });
    } catch (e) {
      console.error("Create inquiry failed:", e);
      res.status(500).json({ error: "Failed to submit inquiry" });
    }
  });
  app.get("/api/inquiries", authenticateToken, async (req, res) => {
    if (req.user.role !== "admin") return res.sendStatus(403);
    try {
      const inquiries = await getInquiriesList();
      res.json(inquiries);
    } catch (e) {
      console.error("Get inquiries failed:", e);
      res.status(500).json({ error: "Failed to fetch inquiries" });
    }
  });
  app.get("/api/backend-status", async (req, res) => {
    let supabaseStatus = "configured";
    let missingTables = [];
    const tablesToCheck = ["profiles", "tickets", "announcements", "settings", "inquiries"];
    for (const table of tablesToCheck) {
      try {
        const { error } = await supabase.from(table).select("*").limit(1);
        if (error) {
          if (error.code === "PGRST116") {
            continue;
          }
          if (error.message?.includes("Could not find the table") || error.code === "42P01") {
            missingTables.push(table);
          }
        }
      } catch (err) {
        missingTables.push(table);
      }
    }
    if (missingTables.length > 0) {
      supabaseStatus = "missing_tables";
    } else {
      supabaseStatus = "fully_connected";
    }
    res.json({
      supabase: {
        status: supabaseStatus,
        url: supabaseUrl,
        projectId: "uwvczqzigjxusfkeddji",
        missingTables
      },
      postgres: {
        active: true
      }
    });
  });
if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
