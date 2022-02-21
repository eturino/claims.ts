import { buildClaim } from "../claim";
import { buildClaimSet, ClaimSet } from "../claim-set";
import { FrozenClaimSetError } from "../errors";

describe("buildClaimSet()", () => {
  it('with [""]: error', async () => {
    expect(() => buildClaimSet([""])).toThrowError();
  });
  it('with ["", "read:valid"]: error', async () => {
    expect(() => buildClaimSet(["", "read:valid"])).toThrowError();
  });
  it('with ["read:*", "admin:valid"]: ClaimSet', async () => {
    const claimSet = buildClaimSet(["read:*", "admin:valid"]);
    const expectedClaims = [buildClaim("read:*"), buildClaim("admin:valid")];
    expect(claimSet).toBeInstanceOf(ClaimSet);
    expect(claimSet.claims).toEqual(expectedClaims);
    expect(claimSet.claims[0]).not.toBe(expectedClaims[0]);
    expect(claimSet.claims[1]).not.toBe(expectedClaims[1]);
  });
  it('with [buildClaim("read:*"), buildClaim("admin:valid")]: ClaimSet (creates new Claims)', async () => {
    const first = buildClaim("read:*");
    const second = buildClaim("admin:valid");
    const claimSet = buildClaimSet([first, second]);
    const expectedClaims = [first, second];
    expect(claimSet).toBeInstanceOf(ClaimSet);
    expect(claimSet.claims).toEqual(expectedClaims);
    expect(claimSet.claims[0]).not.toBe(expectedClaims[0]);
    expect(claimSet.claims[1]).not.toBe(expectedClaims[1]);
  });
});

describe("ClaimSet#check", () => {
  it("returns true if any of the claims return true", async () => {
    const first = buildClaim("read:*");
    const second = buildClaim("admin:valid");
    const claimSet = new ClaimSet([first, second]);

    const firstCheck = jest.fn(() => false);
    const secondCheck = jest.fn(() => false);
    first.check = firstCheck;
    second.check = secondCheck;
    expect(claimSet.check("read:something")).toBeFalsy(); // uses mocks!
    expect(firstCheck.mock.calls.length).toBe(1);
    expect(secondCheck.mock.calls.length).toBe(1);
  });

  it("returns true as soon as a claim returns true", async () => {
    const first = buildClaim("read:another");
    const second = buildClaim("admin:valid");
    const claimSet = new ClaimSet([first, second]);

    const firstCheck = jest.fn(() => true);
    const secondCheck = jest.fn(() => true);
    first.check = firstCheck;
    second.check = secondCheck;
    expect(claimSet.check("read:something")).toBeTruthy(); // uses mocks!
    expect(firstCheck.mock.calls.length).toBe(1);
    expect(secondCheck.mock.calls.length).toBe(0);
  });
});

describe("ClaimSet#directChildren", () => {
  it("returns sorted uniq list of directChild of each Claim, removing nulls", async () => {
    const first = buildClaim("read:*");
    const second = buildClaim("admin:valid");
    const third = buildClaim("admin:valid.other");
    const fourth = buildClaim("admin:valid.another");
    const claimSet = new ClaimSet([first, second, third, fourth]);

    const firstFn = jest.fn(() => null);
    const secondFn = jest.fn(() => "paco");
    const thirdFn = jest.fn(() => "alfa");
    const fourthFn = jest.fn(() => "alfa");
    first.directChild = firstFn;
    second.directChild = secondFn;
    third.directChild = thirdFn;
    fourth.directChild = fourthFn;

    expect(claimSet.directChildren("read:something")).toEqual(["alfa", "paco"]); // uses mocks!
    expect(firstFn.mock.calls.length).toBe(1);
    expect(secondFn.mock.calls.length).toBe(1);
    expect(thirdFn.mock.calls.length).toBe(1);
    expect(fourthFn.mock.calls.length).toBe(1);
  });
});

describe("ClaimSet#directDescendants", () => {
  it("returns sorted uniq list of directDescendant of each Claim, removing nulls", async () => {
    const first = buildClaim("read:*");
    const second = buildClaim("admin:valid");
    const third = buildClaim("admin:valid.other");
    const fourth = buildClaim("admin:valid.another");
    const claimSet = new ClaimSet([first, second, third, fourth]);

    const firstFn = jest.fn(() => null);
    const secondFn = jest.fn(() => "paco");
    const thirdFn = jest.fn(() => "alfa");
    const fourthFn = jest.fn(() => "alfa");
    first.directDescendant = firstFn;
    second.directDescendant = secondFn;
    third.directDescendant = thirdFn;
    fourth.directDescendant = fourthFn;

    expect(claimSet.directDescendants("read:something")).toEqual(["alfa", "paco"]); // uses mocks!
    expect(firstFn.mock.calls.length).toBe(1);
    expect(secondFn.mock.calls.length).toBe(1);
    expect(thirdFn.mock.calls.length).toBe(1);
    expect(fourthFn.mock.calls.length).toBe(1);
  });
});

describe("ClaimSet#isFrozen", () => {
  it("frozen by default", () => {
    const claimSet = new ClaimSet([]);
    expect(claimSet.isFrozen()).toBeTruthy();
  });
});

describe("ClaimSet#freeze", () => {
  it("disallows modifications of the claim set list", () => {
    const claimSet = new ClaimSet([]);
    claimSet.freeze();
    expect(claimSet.isFrozen()).toBeTruthy();
  });
});

describe("ClaimSet#unfreeze", () => {
  it("allows modifications of the claim set list", () => {
    const claimSet = new ClaimSet([]);
    claimSet.freeze();
    expect(claimSet.isFrozen()).toBeTruthy();
    claimSet.unfreeze();
    expect(claimSet.isFrozen()).toBeFalsy();
    claimSet.freeze();
    expect(claimSet.isFrozen()).toBeTruthy();
  });
});

// addIfNotChecked
// addIfNotExact
describe("ClaimSet#addIfNotChecked", () => {
  it("throws with frozen ClaimSet", () => {
    const claimSet = new ClaimSet([]);
    claimSet.freeze();
    expect(() => claimSet.addIfNotChecked(buildClaim("read:*"))).toThrow(FrozenClaimSetError);
    expect(() => claimSet.addIfNotChecked("read:*")).toThrow(FrozenClaimSetError);
    expect(() => claimSet.addIfNotChecked({ verb: "read", resource: "" })).toThrow(FrozenClaimSetError);
    expect(() => claimSet.addIfNotChecked({ verb: "read", resource: "paco" })).toThrow(FrozenClaimSetError);
  });

  it("if same exist, does nothing", () => {
    const claimSet = buildClaimSet(["read:something"]);
    claimSet.unfreeze();
    claimSet.addIfNotChecked("read:something");
    expect(claimSet.claims.map((x) => x.toString())).toEqual(["read:something"]);
  });

  it("if parent exist, does nothing", () => {
    const claimSet = buildClaimSet(["read:*"]);
    claimSet.unfreeze();
    claimSet.addIfNotChecked("read:something");
    expect(claimSet.claims.map((x) => x.toString())).toEqual(["read:*"]);
  });

  it("else, adds it in order", () => {
    const claimSet = buildClaimSet(["read:something"]);
    claimSet.unfreeze();
    claimSet.addIfNotChecked("read:alpha");
    expect(claimSet.claims.map((x) => x.toString())).toEqual(["read:alpha", "read:something"]);
  });
});
describe("ClaimSet#addIfNotExact", () => {
  it("throws with frozen ClaimSet", () => {
    const claimSet = new ClaimSet([]);
    claimSet.freeze();
    expect(() => claimSet.addIfNotExact(buildClaim("read:*"))).toThrow(FrozenClaimSetError);
    expect(() => claimSet.addIfNotExact("read:*")).toThrow(FrozenClaimSetError);
    expect(() => claimSet.addIfNotExact({ verb: "read", resource: "" })).toThrow(FrozenClaimSetError);
    expect(() => claimSet.addIfNotExact({ verb: "read", resource: "paco" })).toThrow(FrozenClaimSetError);
  });

  it("if same exist, does nothing", () => {
    const claimSet = buildClaimSet(["read:something"]);
    claimSet.unfreeze();
    claimSet.addIfNotExact("read:something");
    expect(claimSet.claims.map((x) => x.toString())).toEqual(["read:something"]);
  });

  it("if parent exist, adds the claim in order", () => {
    const claimSet = buildClaimSet(["read:*"]);
    claimSet.unfreeze();
    claimSet.addIfNotExact("read:something");
    expect(claimSet.claims.map((x) => x.toString())).toEqual(["read:*", "read:something"]);
  });

  it("else, adds it in order", () => {
    const claimSet = buildClaimSet(["read:something"]);
    claimSet.unfreeze();
    claimSet.addIfNotChecked("read:alpha");
    expect(claimSet.claims.map((x) => x.toString())).toEqual(["read:alpha", "read:something"]);
  });
});
