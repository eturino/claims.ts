import { Ability, buildAbility } from "../ability";
import { buildClaim } from "../claim";
import { buildClaimSet, ClaimSet } from "../claim-set";
import { KeySetAll, KeySetAllExceptSome, KeySetNone, KeySetSome } from "@eturino/key-set";

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

describe("Ability#accessToResources", () => {
  describe('accessToResources("read:clients")', () => {
    describe('permitted: ["read:clients.*"], prohibited: []', () => {
      it("returns KeySetAll", async () => {
        const ability = buildAbility(["read:clients.*"], []);
        expect(ability.accessToResources("read:clients")).toBeInstanceOf(KeySetAll);
      });
    });

    describe('permitted: ["read:clients.*"], prohibited: ["read:clients"]', () => {
      it("returns KeySetNone", async () => {
        const ability = buildAbility(["read:clients.*"], ["read:clients"]);
        expect(ability.accessToResources("read:clients")).toBeInstanceOf(KeySetNone);
      });
    });

    describe('permitted: ["read:clients.*"], prohibited: ["read:clients.first", "read:clients.second"]', () => {
      it("returns KeySetAllExceptSome(first,second)", async () => {
        const ability = buildAbility(["read:clients.*"], ["read:clients.first", "read:clients.second"]);
        const keySet = ability.accessToResources("read:clients");
        expect(keySet).toBeInstanceOf(KeySetAllExceptSome);
        expect((keySet as KeySetAllExceptSome<string>).keys).toEqual(["first", "second"]);
      });
    });

    describe('permitted: ["read:clients.first.some.stuff", "read:clients.third.other.things"], prohibited: ["read:clients.first", "read:clients.second"]', () => {
      it("returns KeySetSome(third)", async () => {
        const ability = buildAbility(
          ["read:clients.first.some.stuff", "read:clients.third.other.things"],
          ["read:clients.first", "read:clients.second"]
        );
        const keySet = ability.accessToResources("read:clients");
        expect(keySet).toBeInstanceOf(KeySetSome);
        expect((keySet as KeySetSome<string>).keys).toEqual(["third"]);
      });
    });

    describe('permitted: ["read:clients.first", "read:clients.third"], prohibited: ["read:clients"]', () => {
      it("returns KeySetNone", async () => {
        const ability = buildAbility(["read:clients.first", "read:clients.third"], ["read:clients"]);
        const keySet = ability.accessToResources("read:clients");
        expect(keySet).toBeInstanceOf(KeySetNone);
      });
    });

    describe('permitted: ["read:clients.first", "read:clients.third"], prohibited: ["read:clients.third.people"]', () => {
      it("returns KeySetSome(first, third)", async () => {
        const ability = buildAbility(["read:clients.first", "read:clients.third"], ["read:clients.third.people"]);
        const keySet = ability.accessToResources("read:clients");
        expect(keySet).toBeInstanceOf(KeySetSome);
        expect((keySet as KeySetSome<string>).keys).toEqual(["first", "third"]);
      });
    });
  });

  describe("accessToResources('read:clients.my-client.projects.project')", () => {
    describe('permitted: ["read:clients.*"], prohibited: []', () => {
      it("returns KeySetAll", async () => {
        const ability = buildAbility(["read:clients.*"], []);

        expect(ability.accessToResources("read:clients.my-client.projects.project")).toBeInstanceOf(KeySetAll);
      });
    });

    describe('permitted: ["read:clients.*"], prohibited: ["read:clients.my-client.projects"]', () => {
      it("returns KeySetNone", async () => {
        const ability = buildAbility(["read:clients.*"], ["read:clients.my-client.projects"]);

        expect(ability.accessToResources("read:clients.my-client.projects.project")).toBeInstanceOf(KeySetNone);
      });
    });

    describe('permitted: ["read:clients.*"], prohibited: ["read:clients.my-client.projects.project.bad-project"]', () => {
      it("returns KeySetAllExceptSome", async () => {
        const ability = buildAbility(["read:clients.*"], ["read:clients.my-client.projects.project.bad-project"]);

        const keySet = ability.accessToResources("read:clients.my-client.projects.project");
        expect(keySet).toBeInstanceOf(KeySetAllExceptSome);
        expect((keySet as KeySetAllExceptSome<string>).keys).toEqual(["bad-project"]);
      });
    });

    describe("prohibiting people in one of the projects", () => {
      it("it still counts that project", async () => {
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
        expect((keySet as KeySetSome<string>).keys).toEqual(["one-project"]);
      });
    });
  });
});
