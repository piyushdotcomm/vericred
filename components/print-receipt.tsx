import type { Credential, RiskReport } from "@/lib/types";
import { QRCodeSVG } from "qrcode.react";
import { credentialHashBytes32 } from "@/lib/hash";
import { CONTRACT_ADDRESS } from "@/lib/contract-client";
import { toHex } from "viem";

export function PrintReceipt({
  credential,
  result,
  risk,
  issuerSigValid,
}: {
  credential: Credential;
  result: any;
  risk: RiskReport | null;
  issuerSigValid: boolean | null;
}) {
  const docHash = credentialHashBytes32(credential);

  return (
    <div className="hidden print:block w-full text-black bg-white font-sans p-8">
      {/* Header */}
      <div className="border-b-4 border-black pb-6 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tighter">
            VERICRED
          </h1>
          <p className="font-mono text-xs tracking-widest mt-1">
            CRYPTOGRAPHIC VERIFICATION RECEIPT
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs">
            DATE: {new Date().toLocaleDateString()}
          </p>
          <p className="font-mono text-xs mt-1">
            TIME: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Entity Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">
            ISSUED BY
          </h2>
          <p className="font-bold text-lg uppercase">
            {credential.issuerName}
          </p>
          <p className="font-mono text-xs mt-1 truncate">
            {credential.issuerDid}
          </p>
          <p className="font-mono text-xs mt-1 truncate">
            Contract: {CONTRACT_ADDRESS}
          </p>
        </div>
        <div>
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">
            ISSUED TO
          </h2>
          <p className="font-bold text-lg uppercase">
            {credential.studentName}
          </p>
          <p className="font-mono text-xs mt-1 truncate">
            {credential.rollNumber} • {credential.course}
          </p>
          <p className="font-mono text-xs mt-1 truncate">
            Wallet: {credential.studentAddress}
          </p>
        </div>
      </div>

      {/* Verification Status */}
      <div className="border border-black p-6 mb-8">
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-4">
          ON-CHAIN VERIFICATION STATUS
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-mono text-xs text-gray-500">LEDGER STATUS</p>
            <p className="font-bold uppercase">
              {result.valid && !result.revoked ? "VALID & ACTIVE" : "INVALID"}
            </p>
          </div>
          <div>
            <p className="font-mono text-xs text-gray-500">ISSUER SIGNATURE</p>
            <p className="font-bold uppercase">
              {issuerSigValid ? "VERIFIED" : issuerSigValid === false ? "TAMPERED" : "N/A"}
            </p>
          </div>
          <div className="col-span-2 mt-2">
            <p className="font-mono text-xs text-gray-500">DOCUMENT HASH</p>
            <p className="font-mono text-xs break-all">{docHash}</p>
          </div>
        </div>
      </div>

      {/* Risk Oracle */}
      {risk && (
        <div className="border border-black p-6 mb-8 flex justify-between items-center">
          <div>
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1">
              AI ORACLE RISK SCORE
            </h2>
            <p className="font-mono text-xs text-gray-600">
              EIP-712 Attestation: {(risk as any).oracleAddress || "N/A"}
            </p>
          </div>
          <div className="text-3xl font-bold font-mono text-black">
            {risk.score}/100
          </div>
        </div>
      )}

      {/* QR Code */}
      <div className="flex flex-col items-center justify-center mt-12 mb-8">
        <QRCodeSVG value={JSON.stringify(credential)} size={200} level="H" />
        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mt-4">
          SCAN FOR FULL CRYPTOGRAPHIC PAYLOAD
        </p>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-center">
        <p className="font-mono text-[9px] uppercase tracking-widest text-gray-400">
          Generated securely by VeriCred Protocol • vericred.io
        </p>
        <p className="font-mono text-[9px] text-gray-400 mt-1">
          UUID: {credential.id}
        </p>
      </div>
    </div>
  );
}
