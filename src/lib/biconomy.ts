import { ChainId } from "@biconomy/core-types";
import { IBundler, Bundler } from '@biconomy/bundler';
import { DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/account";
import { 
  IPaymaster, 
  BiconomyPaymaster,  
} from '@biconomy/paymaster'

export const bundler: IBundler = new Bundler({
  bundlerUrl: 'https://bundler.biconomy.io/api/v2/80001/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44',
  chainId: ChainId.POLYGON_MUMBAI,
  entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
});

export const paymaster: IPaymaster = new BiconomyPaymaster({
  paymasterUrl: "https://paymaster.biconomy.io/api/v1/80001/TijowNsdb.ec19cd03-9980-4d3a-8fd7-185fb9662e77"
});