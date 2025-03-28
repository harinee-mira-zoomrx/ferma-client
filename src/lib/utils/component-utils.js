export const rootSynonymItemFilter = (label, filterText, option) => {
    return (
        label
            .toLowerCase()
            .includes(filterText.toLowerCase()) ||
        option?.additionalLabel
            ?.toLowerCase()
            ?.includes(filterText.toLowerCase())
    );
};