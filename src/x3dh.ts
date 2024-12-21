import { x25519, ed25519 } from '@noble/curves/ed25519';
import { edwardsToMontgomeryPriv, edwardsToMontgomeryPub } from '@noble/curves/ed25519';
import { sha256 } from '@noble/hashes/sha256';
import { hkdf } from '@noble/hashes/hkdf';

export function generateBobBundle()
    : [[string, string, string[]], [string, string, string, string[]]] {
    // Identity Key pair
    const dsa_priv = ed25519.utils.randomPrivateKey();
    const DSA = ed25519.getPublicKey(dsa_priv);
    // const ik_priv = edwardsToMontgomeryPriv(dsa_priv);
    // const IK = edwardsToMontgomeryPub(DSA);
    // Prekey pair
    const pk_priv = x25519.utils.randomPrivateKey();
    const PK = x25519.getPublicKey(pk_priv);
    // Signature of prekey
    const Sig = ed25519.sign(PK, dsa_priv);
    // console.log(ed25519.verify(Sig, PK, DSA));
    // One-time prekey
    const opk_priv = Array.from({ length: 128 }, x25519.utils.randomPrivateKey);
    const OPK = opk_priv.map(x25519.getPublicKey);

    return [[ArrayToHex(dsa_priv), ArrayToHex(pk_priv), opk_priv.map(ArrayToHex)],
    [ArrayToHex(DSA), ArrayToHex(PK), ArrayToHex(Sig), OPK.map(ArrayToHex)]];
}

// DSAb: string, PKb: string, Sigb: string, OPKb: string
export function generateAliceBundle()
    : [[string, string], [string, string]] {
    // Identity Key pair
    const dsa_priv = ed25519.utils.randomPrivateKey();
    const DSA = ed25519.getPublicKey(dsa_priv);
    // Ephemeral key pair
    const ek_priv = x25519.utils.randomPrivateKey();
    const EK = x25519.getPublicKey(ek_priv);

    return [[ArrayToHex(dsa_priv), ArrayToHex(ek_priv)], [ArrayToHex(DSA), ArrayToHex(EK)]];
}

export function calculateAliceSecret(
    dsa_priv: string,
    eka_priv: string,
    DSAb: string,
    SPKb: string,
    OPKb: string
): string {
    const ika_priv = ArrayToHex(edwardsToMontgomeryPriv(Buffer.from(dsa_priv, 'hex')));
    const IKb = ArrayToHex(edwardsToMontgomeryPub(Buffer.from(DSAb, 'hex')));
    const DH1 = DH(ika_priv, SPKb);
    const DH2 = DH(eka_priv, IKb);
    const DH3 = DH(eka_priv, SPKb);
    const DH4 = DH(eka_priv, OPKb);
    if (OPKb.length !== 1) {
        const SK = hkdf(sha256, DH1 + DH2 + DH3 + DH4, Uint8Array.from([0]), 'info', 32);
        return ArrayToHex(SK);
    }
    const SK = hkdf(sha256, DH1 + DH2 + DH3, Uint8Array.from([0]), 'info', 32);
    return ArrayToHex(SK);
}

export function calculateBobSecret(
    DSA: string,
    EKa: string,
    dsab_priv: string,
    spkb_priv: string,
    opkb_priv: string
): string {
    const ikb_priv = ArrayToHex(edwardsToMontgomeryPriv(Buffer.from(dsab_priv, 'hex')));
    const IKa = ArrayToHex(edwardsToMontgomeryPub(Buffer.from(DSA, 'hex')));
    const DH1 = DH(spkb_priv, IKa);
    const DH2 = DH(ikb_priv, EKa);
    const DH3 = DH(spkb_priv, EKa);
    const DH4 = DH(opkb_priv, EKa);
    //const DH1 = DH(IKa, spkb_priv);
    //const DH2 = DH(EKa, ikb_priv);
    //const DH3 = DH(EKa, spkb_priv);
    //const DH4 = DH(EKa, opkb_priv);
    if (opkb_priv.length !== 1) {
        const SK = hkdf(sha256, DH1 + DH2 + DH3 + DH4, Uint8Array.from([0]), 'info', 32);
        return ArrayToHex(SK);
    }
    const SK = hkdf(sha256, DH1 + DH2 + DH3, Uint8Array.from([0]), 'info', 32);
    return ArrayToHex(SK);
}

function DH(key1: string, key2: string): string {
    const dh = x25519.scalarMult(key1, key2);
    return ArrayToHex(dh);
}

export function ArrayToHex(arr: Uint8Array): string {
    return Buffer.from(arr).toString('hex');
}
