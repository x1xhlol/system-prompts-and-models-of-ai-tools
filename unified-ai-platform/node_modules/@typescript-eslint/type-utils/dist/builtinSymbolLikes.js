"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBuiltinSymbolLikeRecurser = exports.isBuiltinSymbolLike = exports.isBuiltinTypeAliasLike = exports.isReadonlyTypeLike = exports.isReadonlyErrorLike = exports.isErrorLike = exports.isPromiseConstructorLike = exports.isPromiseLike = void 0;
const ts = __importStar(require("typescript"));
const isSymbolFromDefaultLibrary_1 = require("./isSymbolFromDefaultLibrary");
/**
 * class Foo extends Promise<number> {}
 * Foo.reject
 *  ^ PromiseLike
 */
function isPromiseLike(program, type) {
    return isBuiltinSymbolLike(program, type, 'Promise');
}
exports.isPromiseLike = isPromiseLike;
/**
 * const foo = Promise
 * foo.reject
 *  ^ PromiseConstructorLike
 */
function isPromiseConstructorLike(program, type) {
    return isBuiltinSymbolLike(program, type, 'PromiseConstructor');
}
exports.isPromiseConstructorLike = isPromiseConstructorLike;
/**
 * class Foo extends Error {}
 * new Foo()
 *      ^ ErrorLike
 */
function isErrorLike(program, type) {
    return isBuiltinSymbolLike(program, type, 'Error');
}
exports.isErrorLike = isErrorLike;
/**
 * type T = Readonly<Error>
 *      ^ ReadonlyErrorLike
 */
function isReadonlyErrorLike(program, type) {
    return isReadonlyTypeLike(program, type, subtype => {
        const [typeArgument] = subtype.aliasTypeArguments;
        return (isErrorLike(program, typeArgument) ||
            isReadonlyErrorLike(program, typeArgument));
    });
}
exports.isReadonlyErrorLike = isReadonlyErrorLike;
/**
 * type T = Readonly<{ foo: 'bar' }>
 *      ^ ReadonlyTypeLike
 */
function isReadonlyTypeLike(program, type, predicate) {
    return isBuiltinTypeAliasLike(program, type, subtype => {
        return (subtype.aliasSymbol.getName() === 'Readonly' && !!predicate?.(subtype));
    });
}
exports.isReadonlyTypeLike = isReadonlyTypeLike;
function isBuiltinTypeAliasLike(program, type, predicate) {
    return isBuiltinSymbolLikeRecurser(program, type, subtype => {
        const { aliasSymbol, aliasTypeArguments } = subtype;
        if (!aliasSymbol || !aliasTypeArguments) {
            return false;
        }
        if ((0, isSymbolFromDefaultLibrary_1.isSymbolFromDefaultLibrary)(program, aliasSymbol) &&
            predicate(subtype)) {
            return true;
        }
        return null;
    });
}
exports.isBuiltinTypeAliasLike = isBuiltinTypeAliasLike;
function isBuiltinSymbolLike(program, type, symbolName) {
    return isBuiltinSymbolLikeRecurser(program, type, subType => {
        const symbol = subType.getSymbol();
        if (!symbol) {
            return false;
        }
        if (symbol.getName() === symbolName &&
            (0, isSymbolFromDefaultLibrary_1.isSymbolFromDefaultLibrary)(program, symbol)) {
            return true;
        }
        return null;
    });
}
exports.isBuiltinSymbolLike = isBuiltinSymbolLike;
function isBuiltinSymbolLikeRecurser(program, type, predicate) {
    if (type.isIntersection()) {
        return type.types.some(t => isBuiltinSymbolLikeRecurser(program, t, predicate));
    }
    if (type.isUnion()) {
        return type.types.every(t => isBuiltinSymbolLikeRecurser(program, t, predicate));
    }
    const predicateResult = predicate(type);
    if (typeof predicateResult === 'boolean') {
        return predicateResult;
    }
    const symbol = type.getSymbol();
    if (symbol &&
        symbol.flags & (ts.SymbolFlags.Class | ts.SymbolFlags.Interface)) {
        const checker = program.getTypeChecker();
        for (const baseType of checker.getBaseTypes(type)) {
            if (isBuiltinSymbolLikeRecurser(program, baseType, predicate)) {
                return true;
            }
        }
    }
    return false;
}
exports.isBuiltinSymbolLikeRecurser = isBuiltinSymbolLikeRecurser;
//# sourceMappingURL=builtinSymbolLikes.js.map