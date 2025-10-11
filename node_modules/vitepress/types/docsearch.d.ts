export interface DocSearchProps {
  appId: string
  apiKey: string
  indexName: string
  placeholder?: string
  searchParameters?: SearchOptions
  disableUserPersonalization?: boolean
  initialQuery?: string
  insights?: boolean
  translations?: DocSearchTranslations
}

export interface SearchOptions {
  query?: string
  similarQuery?: string
  facetFilters?: string | string[]
  optionalFilters?: string | string[]
  numericFilters?: string | string[]
  tagFilters?: string | string[]
  sumOrFiltersScores?: boolean
  filters?: string
  page?: number
  hitsPerPage?: number
  offset?: number
  length?: number
  attributesToHighlight?: string[]
  attributesToSnippet?: string[]
  attributesToRetrieve?: string[]
  highlightPreTag?: string
  highlightPostTag?: string
  snippetEllipsisText?: string
  restrictHighlightAndSnippetArrays?: boolean
  facets?: string[]
  maxValuesPerFacet?: number
  facetingAfterDistinct?: boolean
  minWordSizefor1Typo?: number
  minWordSizefor2Typos?: number
  allowTyposOnNumericTokens?: boolean
  disableTypoToleranceOnAttributes?: string[]
  queryType?: 'prefixLast' | 'prefixAll' | 'prefixNone'
  removeWordsIfNoResults?: 'none' | 'lastWords' | 'firstWords' | 'allOptional'
  advancedSyntax?: boolean
  advancedSyntaxFeatures?: ('exactPhrase' | 'excludeWords')[]
  optionalWords?: string | string[]
  disableExactOnAttributes?: string[]
  exactOnSingleWordQuery?: 'attribute' | 'none' | 'word'
  alternativesAsExact?: (
    | 'ignorePlurals'
    | 'singleWordSynonym'
    | 'multiWordsSynonym'
  )[]
  enableRules?: boolean
  ruleContexts?: string[]
  distinct?: boolean | number
  analytics?: boolean
  analyticsTags?: string[]
  synonyms?: boolean
  replaceSynonymsInHighlight?: boolean
  minProximity?: number
  responseFields?: string[]
  maxFacetHits?: number
  percentileComputation?: boolean
  clickAnalytics?: boolean
  personalizationImpact?: number
  enablePersonalization?: boolean
  restrictSearchableAttributes?: string[]
  sortFacetValuesBy?: 'count' | 'alpha'
  typoTolerance?: boolean | 'min' | 'strict'
  aroundLatLng?: string
  aroundLatLngViaIP?: boolean
  aroundRadius?: number | 'all'
  aroundPrecision?: number | { from: number; value: number }[]
  minimumAroundRadius?: number
  insideBoundingBox?: number[][]
  insidePolygon?: number[][]
  ignorePlurals?: boolean | string[]
  removeStopWords?: boolean | string[]
  naturalLanguages?: string[]
  getRankingInfo?: boolean
  userToken?: string
  enableABTest?: boolean
  decompoundQuery?: boolean
  relevancyStrictness?: number
}

export interface DocSearchTranslations {
  button?: ButtonTranslations
  modal?: ModalTranslations
}

export interface ButtonTranslations {
  buttonText?: string
  buttonAriaLabel?: string
}

export interface ModalTranslations extends ScreenStateTranslations {
  searchBox?: SearchBoxTranslations
  footer?: FooterTranslations
}

export interface ScreenStateTranslations {
  errorScreen?: ErrorScreenTranslations
  startScreen?: StartScreenTranslations
  noResultsScreen?: NoResultsScreenTranslations
}

export interface SearchBoxTranslations {
  resetButtonTitle?: string
  resetButtonAriaLabel?: string
  cancelButtonText?: string
  cancelButtonAriaLabel?: string
}

export interface FooterTranslations {
  selectText?: string
  selectKeyAriaLabel?: string
  navigateText?: string
  navigateUpKeyAriaLabel?: string
  navigateDownKeyAriaLabel?: string
  closeText?: string
  closeKeyAriaLabel?: string
  searchByText?: string
}

export interface ErrorScreenTranslations {
  titleText?: string
  helpText?: string
}

export interface StartScreenTranslations {
  recentSearchesTitle?: string
  noRecentSearchesText?: string
  saveRecentSearchButtonTitle?: string
  removeRecentSearchButtonTitle?: string
  favoriteSearchesTitle?: string
  removeFavoriteSearchButtonTitle?: string
}

export interface NoResultsScreenTranslations {
  noResultsText?: string
  suggestedQueryText?: string
  reportMissingResultsText?: string
  reportMissingResultsLinkText?: string
}
