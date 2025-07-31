import * as fse from "./index.js";

export {
    copy,
    CopyFilterAsync,
    CopyFilterSync,
    CopyOptions,
    CopyOptionsSync,
    copySync,
    createFile,
    createFileSync,
    createLink,
    createLinkSync,
    createSymlink,
    createSymlinkSync,
    emptyDir,
    emptydir,
    emptyDirSync,
    emptydirSync,
    ensureDir,
    EnsureDirOptions,
    ensureDirSync,
    ensureFile,
    ensureFileSync,
    ensureLink,
    ensureLinkSync,
    ensureSymlink,
    ensureSymlinkSync,
    JsonOutputOptions,
    JsonReadOptions,
    JsonWriteOptions,
    mkdirp,
    mkdirpSync,
    mkdirs,
    mkdirsSync,
    move,
    MoveOptions,
    moveSync,
    NoParamCallback,
    NoParamCallbackWithUndefined,
    outputFile,
    outputFileSync,
    outputJSON,
    outputJson,
    outputJSONSync,
    outputJsonSync,
    pathExists,
    pathExistsSync,
    PathLike,
    readJSON,
    readJson,
    readJSONSync,
    readJsonSync,
    remove,
    removeSync,
    SymlinkType,
    WriteFileOptions,
    writeJSON,
    writeJson,
    writeJSONSync,
    writeJsonSync,
} from "./index.js";

declare const fsExtra: {
    copy: typeof fse.copy;
    copySync: typeof fse.copySync;
    emptyDirSync: typeof fse.emptyDirSync;
    emptydirSync: typeof fse.emptydirSync;
    emptyDir: typeof fse.emptyDir;
    emptydir: typeof fse.emptydir;
    createFile: typeof fse.createFile;
    createFileSync: typeof fse.createFileSync;
    ensureFile: typeof fse.ensureFile;
    ensureFileSync: typeof fse.ensureFileSync;
    createLink: typeof fse.createLink;
    createLinkSync: typeof fse.createLinkSync;
    ensureLink: typeof fse.ensureLink;
    ensureLinkSync: typeof fse.ensureLinkSync;
    createSymlink: typeof fse.createSymlink;
    createSymlinkSync: typeof fse.createSymlinkSync;
    ensureSymlink: typeof fse.ensureSymlink;
    ensureSymlinkSync: typeof fse.ensureSymlinkSync;
    readJson: typeof fse.readJson;
    readJSON: typeof fse.readJSON;
    readJsonSync: typeof fse.readJsonSync;
    readJSONSync: typeof fse.readJSONSync;
    writeJson: typeof fse.writeJson;
    writeJSON: typeof fse.writeJSON;
    writeJsonSync: typeof fse.writeJsonSync;
    writeJSONSync: typeof fse.writeJSONSync;
    outputJson: typeof fse.outputJson;
    outputJSON: typeof fse.outputJSON;
    outputJsonSync: typeof fse.outputJsonSync;
    outputJSONSync: typeof fse.outputJSONSync;
    mkdirs: typeof fse.mkdirs;
    mkdirsSync: typeof fse.mkdirsSync;
    mkdirp: typeof fse.mkdirp;
    mkdirpSync: typeof fse.mkdirpSync;
    ensureDir: typeof fse.ensureDir;
    ensureDirSync: typeof fse.ensureDirSync;
    move: typeof fse.move;
    moveSync: typeof fse.moveSync;
    outputFile: typeof fse.outputFile;
    outputFileSync: typeof fse.outputFileSync;
    pathExists: typeof fse.pathExists;
    pathExistsSync: typeof fse.pathExistsSync;
    remove: typeof fse.remove;
    removeSync: typeof fse.removeSync;
};

export default fsExtra;
