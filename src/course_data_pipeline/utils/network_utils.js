const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryOperation = async (operation, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await operation();
        } catch (err) {
            console.error(`Retry ${i + 1} failed:`, err.message);
            if (i === retries - 1) throw err;
            await wait(delay);
        }
    }
};

export {
    retryOperation
}