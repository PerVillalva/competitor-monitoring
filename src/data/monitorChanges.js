export async function compareDatasets(prevDataset, newDataset) {
    const oldDatasetArray = prevDataset.map((obj) => obj.url);
    const newDatasetArray = newDataset.map((obj) => obj.url);

    const newItems = newDatasetArray.filter(
        (item) => !oldDatasetArray.includes(item),
    );
    return newItems;
}

export async function monitorUpdates(newDataset) {
    const currentDate = new Date();
    const sevenDaysAgo = new Date(
        currentDate.setDate(currentDate.getDate() - 7),
    );

    const newDataChangesArr = newDataset.filter((obj) => {
        if (obj.lastMod) {
            const lastModDate = new Date(obj.lastMod);
            return lastModDate >= sevenDaysAgo;
        }
        return false;
    });

    return newDataChangesArr;
}
