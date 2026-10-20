export interface Sponsor {
  name: string;
  tagline: string;
  href: string;
  logoSrc: string;
  logoAlt: string;
}

/** Set this when a sponsor is booked; the empty slot stays useful until then. */
export const SPONSOR: Sponsor | null = null;

export const SPONSOR_CONTACT_HREF = "/contribute";
