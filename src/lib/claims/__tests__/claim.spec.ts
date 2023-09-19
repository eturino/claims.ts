import { buildClaim, Claim, extractVerbResource, IClaimData } from "../claim";
import { isValidClaimString } from "../is-valid-claim-string";
import { ALLOWED_VERBS, AllowedVerb } from "../rules";

describe("new Claim()", () => {
  it("fails with wrong verb", () => {
    expect(() => new Claim({ verb: "bad" as AllowedVerb, resource: "resource" })).toThrowError();
  });
});

describe("Claim#clone", () => {
  it("makes a clone", () => {
    const original = buildClaim("read:*");
    const cloned = original.clone();
    expect(cloned).not.toBe(original);
    expect(cloned).toEqual(original);
  });
});

describe("buildClaim()", () => {
  it("with empty string: error", async () => {
    expect(() => buildClaim("")).toThrowError();
  });

  it("with 'blah:what': error", async () => {
    expect(() => buildClaim("blah:what")).toThrowError();
  });

  it("with 'blah:*': error", async () => {
    expect(() => buildClaim("blah:*")).toThrowError();
  });

  ALLOWED_VERBS.forEach((verb) => {
    it(`with '${verb}:what': builds Claim (${verb}: what)`, async () => {
      const claim = buildClaim(`${verb}:what`);
      expect(claim).toBeInstanceOf(Claim);
      expect(claim.verb).toEqual(verb);
      expect(claim.hasVerb(verb)).toBeTruthy();
      expect(claim.resource).toEqual("what");
      expect(claim.isGlobal()).toBeFalsy();
    });
  });

  it("with 'admin:what': builds Claim (admin: what)", async () => {
    const claim = buildClaim("admin:what");
    expect(claim).toBeInstanceOf(Claim);
    expect(claim.verb).toEqual("admin");
    expect(claim.hasVerb("admin")).toBeTruthy();
    expect(claim.resource).toEqual("what");
    expect(claim.isGlobal()).toBeFalsy();
  });

  it("with 'admin:what.*': builds Claim (admin: what)", async () => {
    const claim = buildClaim("admin:what.*");
    expect(claim).toBeInstanceOf(Claim);
    expect(claim.verb).toEqual("admin");
    expect(claim.hasVerb("admin")).toBeTruthy();
    expect(claim.resource).toEqual("what");
    expect(claim.isGlobal()).toBeFalsy();
  });

  it("with 'admin:*': builds Claim (global admin)", async () => {
    const claim = buildClaim("admin:*");
    expect(claim).toBeInstanceOf(Claim);
    expect(claim.verb).toEqual("admin");
    expect(claim.hasVerb("admin")).toBeTruthy();
    expect(claim.resource).toBeNull();
    expect(claim.isGlobal()).toBeTruthy();
  });

  it("with 'read:what': builds Claim (read: what)", async () => {
    const claim = buildClaim("read:what");
    expect(claim).toBeInstanceOf(Claim);
    expect(claim.verb).toEqual("read");
    expect(claim.hasVerb("read")).toBeTruthy();
    expect(claim.resource).toEqual("what");
    expect(claim.isGlobal()).toBeFalsy();
  });

  it("with 'read:what.*': builds Claim (read: what)", async () => {
    const claim = buildClaim("read:what.*");
    expect(claim).toBeInstanceOf(Claim);
    expect(claim.verb).toEqual("read");
    expect(claim.hasVerb("read")).toBeTruthy();
    expect(claim.resource).toEqual("what");
    expect(claim.isGlobal()).toBeFalsy();
  });

  it("with 'read:*': builds Claim (global read)", async () => {
    const claim = buildClaim("read:*");
    expect(claim).toBeInstanceOf(Claim);
    expect(claim.verb).toEqual("read");
    expect(claim.hasVerb("read")).toBeTruthy();
    expect(claim.resource).toBeNull();
    expect(claim.isGlobal()).toBeTruthy();
  });
});

describe("Claim#check()", () => {
  describe('buildClaim("read:*")', () => {
    const claim = buildClaim("read:*");

    it(".check('invalid:*'): error", async () => {
      expect(() => claim.check("invalid:*")).toThrowError();
    });

    it(".check('read:*'): true", async () => {
      expect(claim.check("read:*")).toBeTruthy();
    });

    it(".check('read:something.else'): true", async () => {
      expect(claim.check("read:something.else")).toBeTruthy();
    });

    it(".check('admin:*'): false", async () => {
      expect(claim.check("admin:*")).toBeFalsy();
    });
  });
  describe('buildClaim("read:something")', () => {
    const claim = buildClaim("read:something");

    it(".check('read:*'): false", async () => {
      expect(claim.check("read:*")).toBeFalsy();
    });

    it(".check('read:something'): true", async () => {
      expect(claim.check("read:something")).toBeTruthy();
    });

    it(".check('read:something.else'): true", async () => {
      expect(claim.check("read:something.else")).toBeTruthy();
    });

    it(".check('admin:*'): false", async () => {
      expect(claim.check("admin:*")).toBeFalsy();
    });

    it(".check('admin:something'): false", async () => {
      expect(claim.check("admin:something")).toBeFalsy();
    });
  });
});

describe("Claim#toString()", () => {
  describe("global (read:*)", () => {
    it('returns "read:*"', () => {
      const claim = buildClaim("read:*");
      expect(claim.toString()).toEqual("read:*");
    });
  });

  describe("not global (read:something.or.other)", () => {
    it('returns "read:*"', () => {
      const claim = buildClaim("read:something.or.other");
      expect(claim.toString()).toEqual("read:something.or.other");
    });
  });
});

describe("Claim#isExact()", () => {
  describe('buildClaim("read:*")', () => {
    const claim = buildClaim("read:*");

    it(".isExact('invalid:*'): error", async () => {
      expect(() => claim.isExact("invalid:*")).toThrowError();
    });

    it(".isExact('read:*'): true", async () => {
      expect(claim.isExact("read:*")).toBeTruthy();
    });

    it(".isExact('read:something.else'): false", async () => {
      expect(claim.isExact("read:something.else")).toBeFalsy();
    });

    it(".isExact('admin:*'): false", async () => {
      expect(claim.isExact("admin:*")).toBeFalsy();
    });
  });

  describe('buildClaim("read:something")', () => {
    const claim = buildClaim("read:something");

    it(".isExact('read:*'): false", async () => {
      expect(claim.isExact("read:*")).toBeFalsy();
    });

    it(".isExact('read:something'): true", async () => {
      expect(claim.isExact("read:something")).toBeTruthy();
    });

    it(".isExact('read:something.else'): false", async () => {
      expect(claim.isExact("read:something.else")).toBeFalsy();
    });

    it(".isExact('admin:*'): false", async () => {
      expect(claim.isExact("admin:*")).toBeFalsy();
    });

    it(".isExact('admin:something'): false", async () => {
      expect(claim.isExact("admin:something")).toBeFalsy();
    });
  });
});

describe("Claim#directChild()", () => {
  describe('buildClaim("read:*")', () => {
    const claim = buildClaim("read:*");

    it(".directChild('invalid:*'): error", async () => {
      expect(() => claim.directChild("invalid:*")).toThrowError();
    });

    it(".directChild('read:*'): null", async () => {
      expect(claim.directChild("read:*")).toBeNull();
    });

    it(".directChild('read:something.else'): null", async () => {
      expect(claim.directChild("read:something.else")).toBeNull();
    });

    it(".directChild('admin:*'): null", async () => {
      expect(claim.directChild("admin:*")).toBeNull();
    });
  });

  describe('buildClaim("read:something")', () => {
    const claim = buildClaim("read:something");

    it(".directChild('read:*'): 'something'", async () => {
      expect(claim.directChild("read:*")).toEqual("something");
    });

    it(".directChild('read:something'): null", async () => {
      expect(claim.directChild("read:something")).toBeNull();
    });

    it(".directChild('read:something.else'): null", async () => {
      expect(claim.directChild("read:something.else")).toBeNull();
    });

    it(".directChild('read:another.else'): false", async () => {
      expect(claim.directChild("read:another.else")).toBeNull();
    });

    it(".directChild('admin:*'): null", async () => {
      expect(claim.directChild("admin:*")).toBeNull();
    });

    it(".directChild('admin:something'): null", async () => {
      expect(claim.directChild("admin:something")).toBeNull();
    });
  });

  describe('buildClaim("read:what.some.stuff")', () => {
    const claim = buildClaim("read:what.some.stuff");

    it(".directChild('read:*'): null", async () => {
      expect(claim.directChild("read:*")).toBeNull();
    });

    it(".directChild('read:what'): null", async () => {
      expect(claim.directChild("read:what")).toBeNull();
    });

    it(".directChild('read:what.some'): stuff", async () => {
      expect(claim.directChild("read:what.some")).toEqual("stuff");
    });

    it(".directChild('read:what.some.stuff'): null", async () => {
      expect(claim.directChild("read:what.some.stuff")).toBeNull();
    });

    it(".directChild('read:what.some.stuff.kid'): null", async () => {
      expect(claim.directChild("read:what.some.stuff.kid")).toBeNull();
    });

    it(".directChild('admin:*'): null", async () => {
      expect(claim.directChild("admin:*")).toBeNull();
    });

    it(".directChild('admin:something'): null", async () => {
      expect(claim.directChild("admin:something")).toBeNull();
    });
  });
});

describe("Claim#isDirectChild()", () => {
  describe('buildClaim("read:*")', () => {
    const claim = buildClaim("read:*");

    it(".isDirectChild('invalid:*'): error", async () => {
      expect(() => claim.isDirectChild("invalid:*")).toThrowError();
    });

    it(".isDirectChild('read:*'): false", async () => {
      expect(claim.isDirectChild("read:*")).toBeFalsy();
    });

    it(".isDirectChild('read:something.else'): false", async () => {
      expect(claim.isDirectChild("read:something.else")).toBeFalsy();
    });

    it(".isDirectChild('admin:*'): false", async () => {
      expect(claim.isDirectChild("admin:*")).toBeFalsy();
    });
  });

  describe('buildClaim("read:something")', () => {
    const claim = buildClaim("read:something");

    it(".isDirectChild('read:*'): true", async () => {
      expect(claim.isDirectChild("read:*")).toBeTruthy();
    });

    it(".isDirectChild('read:something'): false", async () => {
      expect(claim.isDirectChild("read:something")).toBeFalsy();
    });

    it(".isDirectChild('read:something.else'): false", async () => {
      expect(claim.isDirectChild("read:something.else")).toBeFalsy();
    });

    it(".isDirectChild('read:another.else'): false", async () => {
      expect(claim.isDirectChild("read:another.else")).toBeFalsy();
    });

    it(".isDirectChild('admin:*'): false", async () => {
      expect(claim.isDirectChild("admin:*")).toBeFalsy();
    });

    it(".isDirectChild('admin:something'): false", async () => {
      expect(claim.isDirectChild("admin:something")).toBeFalsy();
    });
  });

  describe('buildClaim("read:what.some.stuff")', () => {
    const claim = buildClaim("read:what.some.stuff");

    it(".isDirectChild('read:*'): false", async () => {
      expect(claim.isDirectChild("read:*")).toBeFalsy();
    });

    it(".isDirectChild('read:what'): false", async () => {
      expect(claim.isDirectChild("read:what")).toBeFalsy();
    });

    it(".isDirectChild('read:what.some'): true", async () => {
      expect(claim.isDirectChild("read:what.some")).toBeTruthy();
    });

    it(".isDirectChild('read:what.some.stuff'): false", async () => {
      expect(claim.isDirectChild("read:what.some.stuff")).toBeFalsy();
    });

    it(".isDirectChild('read:what.some.stuff.kid'): false", async () => {
      expect(claim.isDirectChild("read:what.some.stuff.kid")).toBeFalsy();
    });

    it(".isDirectChild('admin:*'): false", async () => {
      expect(claim.isDirectChild("admin:*")).toBeFalsy();
    });

    it(".isDirectChild('admin:something'): false", async () => {
      expect(claim.isDirectChild("admin:something")).toBeFalsy();
    });
  });
});

describe("Claim#directDescendant()", () => {
  describe('buildClaim("read:*")', () => {
    const claim = buildClaim("read:*");

    it(".directDescendant('invalid:*'): error", async () => {
      expect(() => claim.directDescendant("invalid:*")).toThrowError();
    });

    it(".directDescendant('read:*'): null", async () => {
      expect(claim.directDescendant("read:*")).toBeNull();
    });

    it(".directDescendant('read:something.else'): null", async () => {
      expect(claim.directDescendant("read:something.else")).toBeNull();
    });

    it(".directDescendant('admin:*'): null", async () => {
      expect(claim.directDescendant("admin:*")).toBeNull();
    });
  });

  describe('buildClaim("read:something")', () => {
    const claim = buildClaim("read:something");

    it(".directDescendant('read:*'): 'something'", async () => {
      expect(claim.directDescendant("read:*")).toEqual("something");
    });

    it(".directDescendant('read:something'): null", async () => {
      expect(claim.directDescendant("read:something")).toBeNull();
    });

    it(".directDescendant('read:something.else'): null", async () => {
      expect(claim.directDescendant("read:something.else")).toBeNull();
    });

    it(".directDescendant('admin:*'): null", async () => {
      expect(claim.directDescendant("admin:*")).toBeNull();
    });

    it(".directDescendant('admin:something'): null", async () => {
      expect(claim.directDescendant("admin:something")).toBeNull();
    });
  });

  describe('buildClaim("read:what.some.stuff")', () => {
    const claim = buildClaim("read:what.some.stuff");

    it(".directDescendant('read:*'): 'what'", async () => {
      expect(claim.directDescendant("read:*")).toEqual("what");
    });

    it(".directDescendant('read:what'): 'some'", async () => {
      expect(claim.directDescendant("read:what")).toEqual("some");
    });

    it(".directDescendant('read:what.some'): 'stuff'", async () => {
      expect(claim.directDescendant("read:what.some")).toEqual("stuff");
    });

    it(".directDescendant('read:something.else'): null", async () => {
      expect(claim.directDescendant("read:something.else")).toBeNull();
    });

    it(".directDescendant('admin:*'): null", async () => {
      expect(claim.directDescendant("admin:*")).toBeNull();
    });

    it(".directDescendant('admin:something'): null", async () => {
      expect(claim.directDescendant("admin:something")).toBeNull();
    });
  });
});

describe("Claim#isDirectDescendant()", () => {
  describe('buildClaim("read:*")', () => {
    const claim = buildClaim("read:*");

    it(".isDirectDescendant('invalid:*'): error", async () => {
      expect(() => claim.isDirectDescendant("invalid:*")).toThrowError();
    });

    it(".isDirectDescendant('read:*'): false", async () => {
      expect(claim.isDirectDescendant("read:*")).toBeFalsy();
    });

    it(".isDirectDescendant('read:something.else'): false", async () => {
      expect(claim.isDirectDescendant("read:something.else")).toBeFalsy();
    });

    it(".isDirectDescendant('admin:*'): false", async () => {
      expect(claim.isDirectDescendant("admin:*")).toBeFalsy();
    });
  });

  describe('buildClaim("read:something")', () => {
    const claim = buildClaim("read:something");

    it(".isDirectDescendant('read:*'): true", async () => {
      expect(claim.isDirectDescendant("read:*")).toBeTruthy();
    });

    it(".isDirectDescendant('read:something'): false", async () => {
      expect(claim.isDirectDescendant("read:something")).toBeFalsy();
    });

    it(".isDirectDescendant('read:something.else'): false", async () => {
      expect(claim.isDirectDescendant("read:something.else")).toBeFalsy();
    });

    it(".isDirectDescendant('admin:*'): false", async () => {
      expect(claim.isDirectDescendant("admin:*")).toBeFalsy();
    });

    it(".isDirectDescendant('admin:something'): false", async () => {
      expect(claim.isDirectDescendant("admin:something")).toBeFalsy();
    });
  });

  describe('buildClaim("read:what.some.stuff")', () => {
    const claim = buildClaim("read:what.some.stuff");

    it(".isDirectDescendant('read:*'): true", async () => {
      expect(claim.isDirectDescendant("read:*")).toBeTruthy();
    });

    it(".isDirectDescendant('read:what'): true", async () => {
      expect(claim.isDirectDescendant("read:what")).toBeTruthy();
    });

    it(".isDirectDescendant('read:what.some'): true", async () => {
      expect(claim.isDirectDescendant("read:what.some")).toBeTruthy();
    });

    it(".isDirectDescendant('read:something.else'): false", async () => {
      expect(claim.isDirectDescendant("read:something.else")).toBeFalsy();
    });

    it(".isDirectDescendant('admin:*'): false", async () => {
      expect(claim.isDirectDescendant("admin:*")).toBeFalsy();
    });

    it(".isDirectDescendant('admin:something'): false", async () => {
      expect(claim.isDirectDescendant("admin:something")).toBeFalsy();
    });
  });
});

describe("extractVerbResource()", () => {
  it('extractVerbResource("read:stuff")', () => {
    expect(extractVerbResource("read:stuff")).toEqual({
      verb: "read",
      resource: "stuff",
    });
  });

  it('extractVerbResource("read:*")', () => {
    expect(extractVerbResource("read:*")).toEqual({
      verb: "read",
      resource: null,
    });
  });

  it('extractVerbResource({ verb: "read", resource: "stuff" })', () => {
    expect(extractVerbResource({ verb: "read", resource: "stuff" })).toEqual({
      verb: "read",
      resource: "stuff",
    });
  });

  it('extractVerbResource({ verb: "read", resource: null })', () => {
    expect(extractVerbResource({ verb: "read", resource: null })).toEqual({
      verb: "read",
      resource: null,
    });
  });

  it("fails if given something else", () => {
    expect(() => extractVerbResource({} as IClaimData)).toThrow(); // forcing it to provoke the error
  });
});

describe("isValidClaimString(x)", () => {
  it('isValidClaimString("read:stuff")', () => {
    expect(isValidClaimString("read:stuff")).toBeTruthy();
  });

  it('isValidClaimString("read:stuff.nested")', () => {
    expect(isValidClaimString("read:stuff.nested")).toBeTruthy();
  });

  it('isValidClaimString("read:stuff.nested.*")', () => {
    expect(isValidClaimString("read:stuff.nested.*")).toBeTruthy();
  });

  it('isValidClaimString("read:*")', () => {
    expect(isValidClaimString("read:*")).toBeTruthy();
  });

  it('isValidClaimString("bad:*")', () => {
    expect(isValidClaimString("bad:*")).toBeFalsy();
  });

  it('isValidClaimString("bad!")', () => {
    expect(isValidClaimString("bad!")).toBeFalsy();
  });

  it('isValidClaimString("read:stuff!")', () => {
    expect(isValidClaimString("read:stuff!")).toBeFalsy();
  });

  it('isValidClaimString("read:stuff.*.other")', () => {
    expect(isValidClaimString("read:stuff.*.other")).toBeFalsy();
  });

  it('isValidClaimString("read:stuff..other")', () => {
    expect(isValidClaimString("read:stuff..other")).toBeFalsy();
  });

  it('isValidClaimString("read:stuff.other.")', () => {
    expect(isValidClaimString("read:stuff.other.")).toBeFalsy();
  });
});
