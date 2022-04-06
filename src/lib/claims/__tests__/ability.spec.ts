import { Ability, buildAbility } from "../ability";
import { buildClaim } from "../claim";
import { buildClaimSet, ClaimSet } from "../claim-set";
import { KeySetAll, KeySetAllExceptSome, KeySetNone, KeySetSome } from "@eturino/key-set";

describe("buildAbility()", () => {
  it('with [""] and ["read:valid"]: error', () => {
    expect(() => buildAbility([""], ["read:valid"])).toThrowError();
  });

  it('with ["read:valid"] and [""]: error', () => {
    expect(() => buildAbility(["read:valid"], [""])).toThrowError();
  });

  it('with ["read:*"] and ["read:something"]: Ability with ClaimSets', () => {
    const firstClaim = buildClaim("read:*");
    const secondClaim = buildClaim("read:something");
    const ability = buildAbility(["read:*"], ["read:something"]);

    expect(ability).toBeInstanceOf(Ability);
    expect(ability.permitted).toBeInstanceOf(ClaimSet);
    expect(ability.permitted.claims).toEqual([firstClaim]);
    expect(ability.prohibited).toBeInstanceOf(ClaimSet);
    expect(ability.prohibited.claims).toEqual([secondClaim]);

    expect(ability.cacheID).toEqual('(["read:*"],["read:something"])');
  });
});

describe("Ability#clone", () => {
  it("makes a clone", () => {
    const firstClaim = buildClaim("read:*");
    const secondClaim = buildClaim("read:something");
    const ability = buildAbility(["read:*"], ["read:something"]);

    expect(ability).toBeInstanceOf(Ability);
    expect(ability.permitted).toBeInstanceOf(ClaimSet);
    expect(ability.permitted.claims).toEqual([firstClaim]);
    expect(ability.prohibited).toBeInstanceOf(ClaimSet);
    expect(ability.prohibited.claims).toEqual([secondClaim]);

    expect(ability.cacheID).toEqual('(["read:*"],["read:something"])');

    const cloned = ability.clone();
    expect(cloned.cacheID).toEqual(ability.cacheID);

    expect(cloned).toEqual(ability);
    expect(cloned).not.toBe(ability);
    expect(cloned.permitted).toEqual(ability.permitted);
    expect(cloned.permitted).not.toBe(ability.permitted);
    expect(cloned.prohibited).toEqual(ability.prohibited);
    expect(cloned.prohibited).not.toBe(ability.prohibited);
  });
});

describe("Ability#can", () => {
  it("returns true if permitted.check() and NOT prohibited.check()", () => {
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
  it("inverse of #can", () => {
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
  it("return true if prohibited.check()", () => {
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

  it("regardless of permitted", () => {
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
  it("return true if prohibited.check()", () => {
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

  it("regardless of permitted", () => {
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

describe("Ability#accessToResources", () => {
  describe('accessToResources("read:clients")', () => {
    describe('permitted: ["read:clients.*"], prohibited: []', () => {
      it("returns KeySetAll", () => {
        const ability = buildAbility(["read:clients.*"], []);
        expect(ability.accessToResources("read:clients")).toBeInstanceOf(KeySetAll);
      });
    });

    describe('permitted: ["read:clients.*"], prohibited: ["read:clients"]', () => {
      it("returns KeySetNone", () => {
        const ability = buildAbility(["read:clients.*"], ["read:clients"]);
        expect(ability.accessToResources("read:clients")).toBeInstanceOf(KeySetNone);
      });
    });

    describe('permitted: ["read:clients.*"], prohibited: ["read:clients.first", "read:clients.second"]', () => {
      it("returns KeySetAllExceptSome(first,second)", () => {
        const ability = buildAbility(["read:clients.*"], ["read:clients.first", "read:clients.second"]);
        const keySet = ability.accessToResources("read:clients");
        expect(keySet).toBeInstanceOf(KeySetAllExceptSome);
        expect((keySet as KeySetAllExceptSome<string>).elementsList).toEqual(["first", "second"]);
      });
    });

    describe('permitted: ["read:clients.first.some.stuff", "read:clients.third.other.things"], prohibited: ["read:clients.first", "read:clients.second"]', () => {
      it("returns KeySetSome(third)", () => {
        const ability = buildAbility(
          ["read:clients.first.some.stuff", "read:clients.third.other.things"],
          ["read:clients.first", "read:clients.second"]
        );
        const keySet = ability.accessToResources("read:clients");
        expect(keySet).toBeInstanceOf(KeySetSome);
        expect((keySet as KeySetSome<string>).elementsList).toEqual(["third"]);
      });
    });

    describe('permitted: ["read:clients.first", "read:clients.third"], prohibited: ["read:clients"]', () => {
      it("returns KeySetNone", () => {
        const ability = buildAbility(["read:clients.first", "read:clients.third"], ["read:clients"]);
        const keySet = ability.accessToResources("read:clients");
        expect(keySet).toBeInstanceOf(KeySetNone);
      });
    });

    describe('permitted: ["read:clients.first", "read:clients.third"], prohibited: ["read:clients.third.people"]', () => {
      it("returns KeySetSome(first, third)", () => {
        const ability = buildAbility(["read:clients.first", "read:clients.third"], ["read:clients.third.people"]);
        const keySet = ability.accessToResources("read:clients");
        expect(keySet).toBeInstanceOf(KeySetSome);
        expect((keySet as KeySetSome<string>).elementsList).toEqual(["first", "third"]);
      });
    });
  });

  describe("accessToResources('read:clients.my-client.projects.project')", () => {
    describe('permitted: ["read:clients.*"], prohibited: []', () => {
      it("returns KeySetAll", () => {
        const ability = buildAbility(["read:clients.*"], []);

        expect(ability.accessToResources("read:clients.my-client.projects.project")).toBeInstanceOf(KeySetAll);
      });
    });

    describe('permitted: ["read:clients.*"], prohibited: ["read:clients.my-client.projects"]', () => {
      it("returns KeySetNone", () => {
        const ability = buildAbility(["read:clients.*"], ["read:clients.my-client.projects"]);

        expect(ability.accessToResources("read:clients.my-client.projects.project")).toBeInstanceOf(KeySetNone);
      });
    });

    describe('permitted: ["read:clients.*"], prohibited: ["read:clients.my-client.projects.project.bad-project"]', () => {
      it("returns KeySetAllExceptSome", () => {
        const ability = buildAbility(["read:clients.*"], ["read:clients.my-client.projects.project.bad-project"]);

        const keySet = ability.accessToResources("read:clients.my-client.projects.project");
        expect(keySet).toBeInstanceOf(KeySetAllExceptSome);
        expect((keySet as KeySetAllExceptSome<string>).elementsList).toEqual(["bad-project"]);
      });
    });

    describe("prohibiting people in one of the projects", () => {
      it("it still counts that project", () => {
        const ability = buildAbility(
          [
            "read:clients.my-client.projects.project.one-project",
            "read:clients.my-client.projects.project.bad-project",
          ],
          [
            "read:clients.my-client.projects.project.one-project.people",
            "read:clients.my-client.projects.project.bad-project",
          ]
        );

        const keySet = ability.accessToResources("read:clients.my-client.projects.project");
        expect(keySet).toBeInstanceOf(KeySetSome);
        expect((keySet as KeySetSome<string>).elementsList).toEqual(["one-project"]);
      });
    });
  });
});
