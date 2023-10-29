import axios from 'axios';
import { Dataset, log } from 'crawlee';

const { APIFY_TOKEN, ACTOR_TASK_ID } = process.env;

export async function fetchPreviousDatasetItems() {
    try {
        const actorLastRun = await axios.get(
            `https://api.apify.com/v2/actor-tasks/${ACTOR_TASK_ID}/runs/last?token=${APIFY_TOKEN}&status=SUCCEEDED`,
        );

        const lastRunID = actorLastRun.data.data.defaultDatasetId;

        const previousDataset = await axios.get(
            `https://api.apify.com/v2/datasets/${lastRunID}/items/?token=${APIFY_TOKEN}`,
        );

        return previousDataset.data;
    } catch (error) {
        log.error('Error fetching previous dataset items:', error);
        throw error; // or return a default value or handle the error appropriately
    }
}

export async function fetchCurrentDatasetItems() {
    try {
        const newDataset = await Dataset.open();
        const newDatasetItems = await newDataset.getData();
        return newDatasetItems.items;
    } catch (error) {
        log.error('Error fetching current dataset items:', error.message);
        throw error; // or return a default value or handle the error appropriately
    }
}
