import React, { useState } from "react";

import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import ReactJson from "react-json-view";
import { Cell, toNano } from "@ton/core";
import {
  buildSuccessMerkleProof,
  buildSuccessMerkleUpdate,
  buildVerifyMerkleProof,
  buildVerifyMerkleUpdate,
} from "../../server/utils/exotic";

import './style.scss';
import { TonProofDemoApi } from "../../TonProofDemoApi";

const merkleExampleAddress = 'EQD_5KMZVIqzYY91-t5CdRD_V71wRrVzxDXu9n2XEwz2wwdv';
const merkleProofBody = buildVerifyMerkleProof(buildSuccessMerkleProof());
const merkleUpdateBody = buildVerifyMerkleUpdate(buildSuccessMerkleUpdate());

export const MerkleExample = () => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const handleMerkleProofClick = async () => {
    const response = await TonProofDemoApi.merkleProof();

    if (!('error' in response)) {
      await tonConnectUI.sendTransaction(response);
    }
  };

  const handleMerkleUpdateClick = async () => {
    const myTransaction = {
      validUntil: Math.floor(Date.now() / 1000) + 360,
      messages: [
        {
          address: merkleExampleAddress,
          amount: toNano("0.05").toString(),
          payload: merkleUpdateBody.toBoc().toString("base64")
        }
      ]
    }

    await tonConnectUI.sendTransaction(myTransaction);
  }

  return (
    <div className="merkle-proof-demo">
      <h3>Merkle proof/update</h3>
    {wallet ? (
      <div className={"merkle-proof-demo__buttons"}>
        <button onClick={handleMerkleProofClick}>
          Send merkle proof
        </button>
        <button onClick={handleMerkleUpdateClick}>
          Send merkle update
        </button>
      </div>
    ) : (
      <div className="ton-proof-demo__error">Connect wallet to send transaction</div>
    )}
    </div>
  );
}
