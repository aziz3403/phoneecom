/** Public base URL of the deployed site. Override with NEXT_PUBLIC_SITE_URL. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://phoneecom.vercel.app";

export const SITE_NAME = "reMint";
