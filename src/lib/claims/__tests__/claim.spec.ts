import { buildClaim, Claim } from "../claim";

describe("buildClaim()", () => {
  it("with empty string: error", async () => {
    expect(() => buildClaim("")).toThrowError();
  });

  it("with 'blah:what': error", async () => {
    expect(() => buildClaim("blah:what")).toThrowError();
  });

  it("with 'blah:*': error", async () => {
    expect(() => buildClaim("blah:what")).toThrowError();
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
