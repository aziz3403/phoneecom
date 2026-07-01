import { describe, expect, it } from "vitest";
import {
  emailError, phoneError, nameError, routingError, accountNumberError, zipError,
} from "./validate";

describe("emailError", () => {
  it("accepts normal addresses", () => {
    for (const e of ["a@b.co", "jane.doe+tag@example.com", "x_y%z@sub.domain.org"]) {
      expect(emailError(e), e).toBeUndefined();
    }
  });
  it("rejects typos and malformed addresses", () => {
    for (const e of ["", "plainaddress", "a@b", "a@@b.com", "a b@c.com", "a@b..com", "a@b.c", "a@.com"]) {
      expect(emailError(e), e).toBeTruthy();
    }
  });
});

describe("phoneError", () => {
  it("accepts common US formats", () => {
    for (const p of ["(555) 123-4567", "555-123-4567", "5551234567", "+1 555 123 4567", "1-555-123-4567"]) {
      expect(phoneError(p), p).toBeUndefined();
    }
  });
  it("rejects wrong lengths and junk", () => {
    for (const p of ["", "12345", "555-123-456", "55512345678", "(055) 123-4567", "phone", "555123456789"]) {
      expect(phoneError(p), p).toBeTruthy();
    }
  });
});

describe("nameError", () => {
  it("accepts real names", () => {
    for (const n of ["Jane", "Mary-Jo", "O'Brien", "José", "Van der Berg"]) {
      expect(nameError(n), n).toBeUndefined();
    }
  });
  it("rejects blanks, single letters and digits", () => {
    for (const n of ["", "J", "1234", "Jane99", "@jane"]) {
      expect(nameError(n), n).toBeTruthy();
    }
  });
});

describe("routingError (ABA checksum)", () => {
  // Well-known valid routing numbers
  const valid = ["011000015", "021000021", "121000358", "026009593"];
  it("accepts checksum-valid numbers", () => {
    for (const r of valid) expect(routingError(r), r).toBeUndefined();
  });
  it("accepts separators", () => {
    expect(routingError("021-000-021")).toBeUndefined();
  });
  it("rejects a single mistyped digit", () => {
    // flip one digit of a valid number → checksum must fail
    expect(routingError("021000022")).toBeTruthy();
    expect(routingError("121000359")).toBeTruthy();
  });
  it("rejects wrong lengths, letters and unissued prefixes", () => {
    for (const r of ["", "12345678", "1234567890", "02100002a", "999999992"]) {
      expect(routingError(r), r).toBeTruthy();
    }
  });
});

describe("accountNumberError", () => {
  it("accepts 4–17 digit numbers", () => {
    for (const a of ["1234", "000123456789", "12345678901234567"]) {
      expect(accountNumberError(a), a).toBeUndefined();
    }
  });
  it("rejects too short, too long and non-digits", () => {
    for (const a of ["", "123", "123456789012345678", "12a45", "12 3"]) {
      // "12 3" strips spaces → "123" → too short
      expect(accountNumberError(a), a).toBeTruthy();
    }
  });
});

describe("zipError", () => {
  it("accepts ZIP and ZIP+4", () => {
    expect(zipError("94105")).toBeUndefined();
    expect(zipError("94105-1234")).toBeUndefined();
  });
  it("rejects everything else", () => {
    for (const z of ["", "9410", "941055", "94105-12", "ABCDE"]) {
      expect(zipError(z), z).toBeTruthy();
    }
  });
});
