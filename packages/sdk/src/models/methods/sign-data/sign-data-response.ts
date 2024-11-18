export interface SignDataResponse {
    /**
     *  base64 encoded signature 
     */
    signature: string;
    
    /**
     * UNIX timestamp in seconds (UTC) at the moment on creating the signature.
     */
    timestamp: string;
}
