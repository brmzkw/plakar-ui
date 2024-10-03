// To parse this data:
//
//   import { Convert, Types } from "./file";
//
//   const types = Convert.toTypes(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Types {
    Repository:    Repository;
    Headers:       Header[];
    MajorTypes:    MajorTypes;
    MimeTypes:     MIMETypes;
    Extensions:    Extensions;
    MajorTypesPct: MajorTypes;
    MimeTypesPct:  MIMETypes;
    ExtensionsPct: Extensions;
}

export interface Extensions {
    none: number;
}

export interface Header {
    IndexID:              string;
    Version:              string;
    CreationTime:         Date;
    CreationDuration:     number;
    PublicKey:            string;
    Tags:                 any[];
    Hostname:             string;
    Username:             string;
    OperatingSystem:      string;
    MachineID:            string;
    ProcessID:            number;
    CommandLine:          string;
    ScanSize:             number;
    ScanProcessedSize:    number;
    ScannedDirectories:   string[];
    Index:                Index;
    VFS:                  Index;
    Metadata:             Index;
    ChunksCount:          number;
    ChunksSize:           number;
    ObjectsCount:         number;
    FilesCount:           number;
    DirectoriesCount:     number;
    NonRegularCount:      number;
    PathnamesCount:       number;
    ObjectsTransferCount: number;
    ObjectsTransferSize:  number;
    ChunksTransferCount:  number;
    ChunksTransferSize:   number;
    FileKind:             MajorTypes;
    FileType:             MIMETypes;
    FileExtension:        Extensions;
    FilePercentKind:      MajorTypes;
    FilePercentType:      MIMETypes;
    FilePercentExtension: Extensions;
}

export interface MajorTypes {
    application: number;
}

export interface MIMETypes {
    "application/x-mach-binary": number;
}

export interface Index {
    Type:     string;
    Version:  string;
    Checksum: number[];
    Size:     number;
}

export interface Repository {
    CreationTime:   Date;
    RepositoryID:   string;
    Version:        string;
    Encryption:     string;
    EncryptionKey:  string;
    Compression:    string;
    Hashing:        string;
    Chunking:       string;
    ChunkingMin:    number;
    ChunkingNormal: number;
    ChunkingMax:    number;
    PackfileSize:   number;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toTypes(json: string): Types {
        return cast(JSON.parse(json), r("Types"));
    }

    public static typesToJson(value: Types): string {
        return JSON.stringify(uncast(value, r("Types")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : '';
    const keyText = key ? ` for key "${key}"` : '';
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}

function prettyTypeName(typ: any): string {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`;
        } else {
            return `one of [${typ.map(a => { return prettyTypeName(a); }).join(", ")}]`;
        }
    } else if (typeof typ === "object" && typ.literal !== undefined) {
        return typ.literal;
    } else {
        return typeof typ;
    }
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key, parent);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val, key, parent);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases.map(a => { return l(a); }), val, key, parent);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue(l("Date"), val, key, parent);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue(l(ref || "object"), val, key, parent);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, key, ref);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key, ref);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val, key, parent);
    }
    if (typ === false) return invalidValue(typ, val, key, parent);
    let ref: any = undefined;
    while (typeof typ === "object" && typ.ref !== undefined) {
        ref = typ.ref;
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val, key, parent);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
    return { literal: typ };
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "Types": o([
        { json: "Repository", js: "Repository", typ: r("Repository") },
        { json: "Headers", js: "Headers", typ: a(r("Header")) },
        { json: "MajorTypes", js: "MajorTypes", typ: r("MajorTypes") },
        { json: "MimeTypes", js: "MimeTypes", typ: r("MIMETypes") },
        { json: "Extensions", js: "Extensions", typ: r("Extensions") },
        { json: "MajorTypesPct", js: "MajorTypesPct", typ: r("MajorTypes") },
        { json: "MimeTypesPct", js: "MimeTypesPct", typ: r("MIMETypes") },
        { json: "ExtensionsPct", js: "ExtensionsPct", typ: r("Extensions") },
    ], false),
    "Extensions": o([
        { json: "none", js: "none", typ: 3.14 },
    ], false),
    "Header": o([
        { json: "IndexID", js: "IndexID", typ: "" },
        { json: "Version", js: "Version", typ: "" },
        { json: "CreationTime", js: "CreationTime", typ: Date },
        { json: "CreationDuration", js: "CreationDuration", typ: 0 },
        { json: "PublicKey", js: "PublicKey", typ: "" },
        { json: "Tags", js: "Tags", typ: a("any") },
        { json: "Hostname", js: "Hostname", typ: "" },
        { json: "Username", js: "Username", typ: "" },
        { json: "OperatingSystem", js: "OperatingSystem", typ: "" },
        { json: "MachineID", js: "MachineID", typ: "" },
        { json: "ProcessID", js: "ProcessID", typ: 0 },
        { json: "CommandLine", js: "CommandLine", typ: "" },
        { json: "ScanSize", js: "ScanSize", typ: 0 },
        { json: "ScanProcessedSize", js: "ScanProcessedSize", typ: 0 },
        { json: "ScannedDirectories", js: "ScannedDirectories", typ: a("") },
        { json: "Index", js: "Index", typ: r("Index") },
        { json: "VFS", js: "VFS", typ: r("Index") },
        { json: "Metadata", js: "Metadata", typ: r("Index") },
        { json: "ChunksCount", js: "ChunksCount", typ: 0 },
        { json: "ChunksSize", js: "ChunksSize", typ: 0 },
        { json: "ObjectsCount", js: "ObjectsCount", typ: 0 },
        { json: "FilesCount", js: "FilesCount", typ: 0 },
        { json: "DirectoriesCount", js: "DirectoriesCount", typ: 0 },
        { json: "NonRegularCount", js: "NonRegularCount", typ: 0 },
        { json: "PathnamesCount", js: "PathnamesCount", typ: 0 },
        { json: "ObjectsTransferCount", js: "ObjectsTransferCount", typ: 0 },
        { json: "ObjectsTransferSize", js: "ObjectsTransferSize", typ: 0 },
        { json: "ChunksTransferCount", js: "ChunksTransferCount", typ: 0 },
        { json: "ChunksTransferSize", js: "ChunksTransferSize", typ: 0 },
        { json: "FileKind", js: "FileKind", typ: r("MajorTypes") },
        { json: "FileType", js: "FileType", typ: r("MIMETypes") },
        { json: "FileExtension", js: "FileExtension", typ: r("Extensions") },
        { json: "FilePercentKind", js: "FilePercentKind", typ: r("MajorTypes") },
        { json: "FilePercentType", js: "FilePercentType", typ: r("MIMETypes") },
        { json: "FilePercentExtension", js: "FilePercentExtension", typ: r("Extensions") },
    ], false),
    "MajorTypes": o([
        { json: "application", js: "application", typ: 0 },
    ], false),
    "MIMETypes": o([
        { json: "application/x-mach-binary", js: "application/x-mach-binary", typ: 0 },
    ], false),
    "Index": o([
        { json: "Type", js: "Type", typ: "" },
        { json: "Version", js: "Version", typ: "" },
        { json: "Checksum", js: "Checksum", typ: a(0) },
        { json: "Size", js: "Size", typ: 0 },
    ], false),
    "Repository": o([
        { json: "CreationTime", js: "CreationTime", typ: Date },
        { json: "RepositoryID", js: "RepositoryID", typ: "" },
        { json: "Version", js: "Version", typ: "" },
        { json: "Encryption", js: "Encryption", typ: "" },
        { json: "EncryptionKey", js: "EncryptionKey", typ: "" },
        { json: "Compression", js: "Compression", typ: "" },
        { json: "Hashing", js: "Hashing", typ: "" },
        { json: "Chunking", js: "Chunking", typ: "" },
        { json: "ChunkingMin", js: "ChunkingMin", typ: 0 },
        { json: "ChunkingNormal", js: "ChunkingNormal", typ: 0 },
        { json: "ChunkingMax", js: "ChunkingMax", typ: 0 },
        { json: "PackfileSize", js: "PackfileSize", typ: 0 },
    ], false),
};
