import { Ability, buildAbility } from "../ability";
import { buildClaim } from "../claim";
import { buildClaimSet, ClaimSet } from "../claim-set";

describe("buildAbility()", () => {
  it('with [""] and ["read:valid"]: error', async () => {
    expect(() => buildAbility([""], ["read:valid"])).toThrowError();
  });

  it('with ["read:valid"] and [""]: error', async () => {
    expect(() => buildAbility(["read:valid"], [""])).toThrowError();
  });

  it('with ["read:*"] and ["read:something"]: Ability with ClaimSets', async () => {
    const firstClaim = buildClaim("read:*");
    const secondClaim = buildClaim("read:something");
    const ability = buildAbility(["read:*"], ["read:something"]);

    expect(ability).toBeInstanceOf(Ability);
    expect(ability.permitted).toBeInstanceOf(ClaimSet);
    expect(ability.permitted.claims).toEqual([firstClaim]);
    expect(ability.prohibited).toBeInstanceOf(ClaimSet);
    expect(ability.prohibited.claims).toEqual([secondClaim]);
  });
});

describe("Ability#can", () => {
  it("returns true if permitted.check() and NOT prohibited.check()", async () => {
    const permitted = buildClaimSet([]);
    const prohibited = buildClaimSet([]);
    const ability = new Ability(permitted, prohibited);

    const permittedFn = jest.fn(() => true);
    const prohibitedFn = jest.fn(() => false);
    permitted.check = permittedFn;
    prohibited.check = prohibitedFn;

    expect(ability.can("read:whatever")).toBeTruthy(); // uses mocks!
    expect(permittedFn.mock.calls.length).toBe(1);
    expect(prohibitedFn.mock.calls.length).toBe(1);
  });
});

describe("Ability#cannot", () => {
  it("inverse of #can", async () => {
    const permitted = buildClaimSet([]);
    const prohibited = buildClaimSet([]);
    const ability = new Ability(permitted, prohibited);

    const permittedFn = jest.fn(() => true);
    const prohibitedFn = jest.fn(() => false);
    permitted.check = permittedFn;
    prohibited.check = prohibitedFn;

    expect(ability.cannot("read:whatever")).toBeFalsy(); // uses mocks!
    expect(permittedFn.mock.calls.length).toBe(1);
    expect(prohibitedFn.mock.calls.length).toBe(1);
  });
});

describe("Ability#isExplicitlyProhibited", () => {
  it("return true if prohibited.check()", async () => {
    const permitted = buildClaimSet([]);
    const prohibited = buildClaimSet([]);
    const ability = new Ability(permitted, prohibited);

    const permittedFn = jest.fn(() => true);
    const prohibitedFn = jest.fn(() => true);
    permitted.check = permittedFn;
    prohibited.check = prohibitedFn;

    expect(ability.isExplicitlyProhibited("read:whatever")).toBeTruthy(); // uses mocks!
    expect(permittedFn.mock.calls.length).toBe(0);
    expect(prohibitedFn.mock.calls.length).toBe(1);
  });

  it("regardless of permitted", async () => {
    const permitted = buildClaimSet([]);
    const prohibited = buildClaimSet([]);
    const ability = new Ability(permitted, prohibited);

    const permittedFn = jest.fn(() => false);
    const prohibitedFn = jest.fn(() => false);
    permitted.check = permittedFn;
    prohibited.check = prohibitedFn;

    expect(ability.isExplicitlyProhibited("read:whatever")).toBeFalsy(); // uses mocks!
    expect(permittedFn.mock.calls.length).toBe(0);
    expect(prohibitedFn.mock.calls.length).toBe(1);
  });
});

describe("Ability#isExplicitlyProhibited", () => {
  it("return true if prohibited.check()", async () => {
    const permitted = buildClaimSet([]);
    const prohibited = buildClaimSet([]);
    const ability = new Ability(permitted, prohibited);

    const permittedFn = jest.fn(() => true);
    const prohibitedFn = jest.fn(() => true);
    permitted.check = permittedFn;
    prohibited.check = prohibitedFn;

    expect(ability.isExplicitlyProhibited("read:whatever")).toBeTruthy(); // uses mocks!
    expect(permittedFn.mock.calls.length).toBe(0);
    expect(prohibitedFn.mock.calls.length).toBe(1);
  });

  it("regardless of permitted", async () => {
    const permitted = buildClaimSet([]);
    const prohibited = buildClaimSet([]);
    const ability = new Ability(permitted, prohibited);

    const permittedFn = jest.fn(() => false);
    const prohibitedFn = jest.fn(() => false);
    permitted.check = permittedFn;
    prohibited.check = prohibitedFn;

    expect(ability.isExplicitlyProhibited("read:whatever")).toBeFalsy(); // uses mocks!
    expect(permittedFn.mock.calls.length).toBe(0);
    expect(prohibitedFn.mock.calls.length).toBe(1);
  });
});

// TODO: add ability.accessToResources(query)
