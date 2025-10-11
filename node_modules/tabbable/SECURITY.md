# Security Policy

## Supported Versions

The most recently published version is the only supported version. We simply do not have the maintainer capacity to support multiple versions.

## Security Releases

The most recently published version is the only supported version. If there's a security issue in that version, then we will fix it by publishing a new version that addresses the vulnerability, but we will not support or update any previous versions.

__Example Scenario__

If we eventually publish 6.0.0 and a security issue is found in 5.1.3, and it's still in 6.0.0, then we will fix it in 6.0.1 or 6.1.0 (or possibly 7.0.0 if it requires breaking backward compatibility for some reason -- this should be rare), but we will not also publish 5.1.4 or 5.2.1 to fix it.

There could also be a scenario where we're in a pre-release on a new major and a security issue is discovered in the current 5.1.3 release. In that case, we would try to fix it in the current non-pre-release, and bring that forward into the pre-release, but that's as far back as we would go (though we don't consider that going back because the latest release isn't a "full" release, it's still in pre-release stage, so we don't expect everyone to want to adopt a pre-release to get security fix).

## Release Cadence

This happens whenever there's something new to publish, regardless of the [Semver](https://semver.org/) bump, though we try to avoid breaking changes (majors) as much as possible. That time may come, however, and the major version change is an indication that there _may_ be a large change/break in functionality. We may also publish a major out of an abundance of caution, even if there are technically no known backward compatibility breaks, if there have been many internal changes.

When planning a major break in functionality for a new major release where we wish to gather feedback from the community prior to officially publishing it, we would leverage the pre-release version indicator by publishing 6.0.0-alpha.1, for example. After gathering some feedback, we may publishing additional pre-release versions, until we would finally officially publish as 6.0.0.

We may not always leverage pre-releases for breaking changes, however. One scenario would be a complex security issue that would force a breaking change, and needs immediate fixing.

## Backwards Compatibility

This is only guaranteed _within_ a major, not from one major to the next. [Semver](https://semver.org/) states that, "the major version is incremented if any backwards _incompatible_ changes are introduced." That is what we respect for this package. Patches are bug fixes that remain backward compatible (to the current major), minors for new features (or significant internal changes) that remain backward-compatible (to the current major), and majors are for breaking changes (from the previous major).

## Reporting Vulnerabilities

If you believe you have found a security vulnerability in this package, please contact one of the maintainers directly and provide them with details, severity, and a reproduction. We would also welcome a suggested fix if you have one.

Any verified and accepted security vulnerabilities will be rewarded with a listing in a special "Hall of Fame" section of our README, similar to our [Contributors](./README.md#contributors) section. We do NOT offer any type of reward whatsoever other than this listing, and we do NOT guarantee that the listing will remain in the repository for any release made after the one which will address the vulnerability.

### Maintainers

- [Stefan Cameron](mailto:stefan@stefcameron.com)
