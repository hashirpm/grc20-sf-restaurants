# GRC20 SF Restaurant Scraper 

This project scrapes restaurant data in San Francisco and uploads it to a Geo Browser space using the GRC20 library. 

## What I Have Done  

1. **Created a Space**  
    - I created a space in the Geo Browser using GRC20 Library.  
    - **Space ID**: `EWysNefhXimrbsCf1oR5Ky`  

2. **Implemented the Scraper**  
    - The scraper collects restaurant information such as name, location, and other relevant details from a website.
    - **Link to Code**: The scraper implementation can be found in the [`scraper.ts`](./src/scraper.ts) file.

3. **Created Entities**  
    - Creates entities with the Restaurant Type ID `A9QizqoXSqjfPUBjLoPJa2`  

4. **Published to IPFS**
    - Edit published to IPFS with CID `ipfs://bafkreigbh2cm5vdwc2qdb73tt3hksioazxse6tptbncrksnsgwgh6tkab4`
    
5. **Published the edit onchain**
    - Transaction Hash  `0x2ea5b021777c4e8367bcbfc3ad1a7db17663dcf081870dd55e40c56611428dca`

## How to Use  

1. Clone the repository:  
    ```bash  
    git clone https://github.com/hashirpm/grc20-sf-restaurants  
    cd grc20-sf-restaurants 
    ```  

2. Install dependencies:  
    ```bash  
    npm install  
    ```  
3. Configure Environment:  
    Create a `.env` file in the project root with the following content:  
    ```plaintext
    GEO_PRIVATE_KEY=0x<your-private-key>
    ```  
    Replace `<your-private-key>` with your actual private key.  

4. Run the server:  
    ```bash  
    npm start  
    ```  

 
