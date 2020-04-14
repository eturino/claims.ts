import { buildClaim } from "../claim";
import { buildClaimSet, ClaimSet } from "../claim-set";

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
