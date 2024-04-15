import { TwoWayKeyIdMap } from "@/core/tosca-adapter/TwoWayKeyIdMap"
import { expect, test } from "vitest";

test("two way map saves pair", ()  => {

    let map = new TwoWayKeyIdMap();
    map.add("mykey", "1234");

    expect(map.getId("mykey")).toBe("1234");

    expect(map.getKey("1234")).toBe("mykey")

})

test("two way map does not allow double keys", ()  => {

    let map = new TwoWayKeyIdMap();
    map.add("mykey", "1234");

    expect(()=> map.add("mykey", "1234")).toThrowError();
    expect(() => map.add("mykey", "5678")).toThrowError();
    expect(() => map.add("otherkey", "1234")).toThrowError();

})