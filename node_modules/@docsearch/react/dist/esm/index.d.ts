import { BaseItem, AutocompleteState, AutocompleteContext, AutocompleteInsightsApi, AutocompleteOptions } from '@algolia/autocomplete-core';
import { LiteClient, SearchParamsObject } from 'algoliasearch/lite';
import React from 'react';

type ContentType = 'content' | 'lvl0' | 'lvl1' | 'lvl2' | 'lvl3' | 'lvl4' | 'lvl5' | 'lvl6';
interface DocSearchHitAttributeHighlightResult {
    value: string;
    matchLevel: 'full' | 'none' | 'partial';
    matchedWords: string[];
    fullyHighlighted?: boolean;
}
interface DocSearchHitHighlightResultHierarchy {
    lvl0: DocSearchHitAttributeHighlightResult;
    lvl1: DocSearchHitAttributeHighlightResult;
    lvl2: DocSearchHitAttributeHighlightResult;
    lvl3: DocSearchHitAttributeHighlightResult;
    lvl4: DocSearchHitAttributeHighlightResult;
    lvl5: DocSearchHitAttributeHighlightResult;
    lvl6: DocSearchHitAttributeHighlightResult;
}
interface DocSearchHitHighlightResult {
    content: DocSearchHitAttributeHighlightResult;
    hierarchy: DocSearchHitHighlightResultHierarchy;
    hierarchy_camel: DocSearchHitHighlightResultHierarchy[];
}
interface DocSearchHitAttributeSnippetResult {
    value: string;
    matchLevel: 'full' | 'none' | 'partial';
}
interface DocSearchHitSnippetResult {
    content: DocSearchHitAttributeSnippetResult;
    hierarchy: DocSearchHitHighlightResultHierarchy;
    hierarchy_camel: DocSearchHitHighlightResultHierarchy[];
}
declare type DocSearchHit = {
    objectID: string;
    content: string | null;
    url: string;
    url_without_anchor: string;
    type: ContentType;
    anchor: string | null;
    hierarchy: {
        lvl0: string;
        lvl1: string;
        lvl2: string | null;
        lvl3: string | null;
        lvl4: string | null;
        lvl5: string | null;
        lvl6: string | null;
    };
    _highlightResult: DocSearchHitHighlightResult;
    _snippetResult: DocSearchHitSnippetResult;
    _rankingInfo?: {
        promoted: boolean;
        nbTypos: number;
        firstMatchedWord: number;
        proximityDistance?: number;
        geoDistance: number;
        geoPrecision?: number;
        nbExactWords: number;
        words: number;
        filters: number;
        userScore: number;
        matchedGeoLocation?: {
            lat: number;
            lng: number;
            distance: number;
        };
    };
    _distinctSeqID?: number;
    __autocomplete_indexName?: string;
    __autocomplete_queryID?: string;
    __autocomplete_algoliaCredentials?: {
        appId: string;
        apiKey: string;
    };
    __autocomplete_id?: number;
};

interface DocSearchContext extends AutocompleteContext {
    algoliaInsightsPlugin?: {
        insights: AutocompleteInsightsApi;
    };
}
interface DocSearchState<TItem extends BaseItem> extends AutocompleteState<TItem> {
    context: DocSearchContext;
}

type InternalDocSearchHit = DocSearchHit & {
    __docsearch_parent: InternalDocSearchHit | null;
};

type StoredDocSearchHit = Omit<DocSearchHit, '_highlightResult' | '_snippetResult'>;

type DocSearchTranslations = Partial<{
    button: ButtonTranslations;
    modal: ModalTranslations;
}>;
type DocSearchTransformClient = {
    search: LiteClient['search'];
    addAlgoliaAgent: LiteClient['addAlgoliaAgent'];
    transporter: Pick<LiteClient['transporter'], 'algoliaAgent'>;
};
interface DocSearchProps {
    appId: string;
    apiKey: string;
    indexName: string;
    placeholder?: string;
    searchParameters?: SearchParamsObject;
    maxResultsPerGroup?: number;
    transformItems?: (items: DocSearchHit[]) => DocSearchHit[];
    hitComponent?: (props: {
        hit: InternalDocSearchHit | StoredDocSearchHit;
        children: React.ReactNode;
    }) => JSX.Element;
    resultsFooterComponent?: (props: {
        state: AutocompleteState<InternalDocSearchHit>;
    }) => JSX.Element | null;
    transformSearchClient?: (searchClient: DocSearchTransformClient) => DocSearchTransformClient;
    disableUserPersonalization?: boolean;
    initialQuery?: string;
    navigator?: AutocompleteOptions<InternalDocSearchHit>['navigator'];
    translations?: DocSearchTranslations;
    getMissingResultsUrl?: ({ query }: {
        query: string;
    }) => string;
    insights?: AutocompleteOptions<InternalDocSearchHit>['insights'];
}
declare function DocSearch(props: DocSearchProps): JSX.Element;

type ButtonTranslations = Partial<{
    buttonText: string;
    buttonAriaLabel: string;
}>;
type DocSearchButtonProps = React.ComponentProps<'button'> & {
    translations?: ButtonTranslations;
};
declare const DocSearchButton: React.ForwardRefExoticComponent<Omit<DocSearchButtonProps, "ref"> & React.RefAttributes<HTMLButtonElement>>;

type FooterTranslations = Partial<{
    selectText: string;
    selectKeyAriaLabel: string;
    navigateText: string;
    navigateUpKeyAriaLabel: string;
    navigateDownKeyAriaLabel: string;
    closeText: string;
    closeKeyAriaLabel: string;
    searchByText: string;
}>;

type ErrorScreenTranslations = Partial<{
    titleText: string;
    helpText: string;
}>;

type NoResultsScreenTranslations = Partial<{
    noResultsText: string;
    suggestedQueryText: string;
    reportMissingResultsText: string;
    reportMissingResultsLinkText: string;
}>;

type StartScreenTranslations = Partial<{
    recentSearchesTitle: string;
    noRecentSearchesText: string;
    saveRecentSearchButtonTitle: string;
    removeRecentSearchButtonTitle: string;
    favoriteSearchesTitle: string;
    removeFavoriteSearchButtonTitle: string;
}>;

type ScreenStateTranslations = Partial<{
    errorScreen: ErrorScreenTranslations;
    startScreen: StartScreenTranslations;
    noResultsScreen: NoResultsScreenTranslations;
}>;

type SearchBoxTranslations = Partial<{
    resetButtonTitle: string;
    resetButtonAriaLabel: string;
    cancelButtonText: string;
    cancelButtonAriaLabel: string;
    searchInputLabel: string;
}>;

type ModalTranslations = Partial<{
    searchBox: SearchBoxTranslations;
    footer: FooterTranslations;
}> & ScreenStateTranslations;
type DocSearchModalProps = DocSearchProps & {
    initialScrollY: number;
    onClose?: () => void;
    translations?: ModalTranslations;
};
declare function DocSearchModal({ appId, apiKey, indexName, placeholder, searchParameters, maxResultsPerGroup, onClose, transformItems, hitComponent, resultsFooterComponent, navigator, initialScrollY, transformSearchClient, disableUserPersonalization, initialQuery: initialQueryFromProp, translations, getMissingResultsUrl, insights, }: DocSearchModalProps): JSX.Element;

interface UseDocSearchKeyboardEventsProps {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    onInput?: (event: KeyboardEvent) => void;
    searchButtonRef?: React.RefObject<HTMLButtonElement>;
}
declare function useDocSearchKeyboardEvents({ isOpen, onOpen, onClose, onInput, searchButtonRef, }: UseDocSearchKeyboardEventsProps): void;

declare const version = "3.8.2";

export { type ButtonTranslations, DocSearch, DocSearchButton, type DocSearchButtonProps, type DocSearchHit, DocSearchModal, type DocSearchModalProps, type DocSearchProps, type DocSearchState, type DocSearchTransformClient, type DocSearchTranslations, type InternalDocSearchHit, type ModalTranslations, type StoredDocSearchHit, type UseDocSearchKeyboardEventsProps, useDocSearchKeyboardEvents, version };
