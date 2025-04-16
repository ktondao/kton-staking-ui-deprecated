import { useAccount } from "wagmi";
import { useEffect } from "react";

import { useBigIntContractQuery } from "@/hooks/useBigIntContractQuery";
import { useChain } from "@/hooks/useChain";
import { ActionProps } from "@/types/action";
import { abi } from '@/config/abi/KTONStakingRewards';
import { usePoolAmount } from "@/hooks/usePoolAmount";
import { useMigrate } from "@/hooks/useMigrate";
import { useMigrateState } from "@/hooks/useMigrateState";
import { formatNumericValue } from "@/utils";
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import Loading from "./loading";

const newPoolButtonText = "Stake in new pool";
const newPoolUrl = "https://staking.ktondao.xyz"

const Migrate = ({ onTransactionActiveChange }: ActionProps) => {
  const { address, isConnected } = useAccount();
  const { isSupportedChainId, activeChain } = useChain();
  const { refetch: refetchPoolAmount } = usePoolAmount();

  const { value, formatted, isLoadingOrRefetching, refetch: refetchBalance } = useBigIntContractQuery({
    contractAddress: activeChain.stakingContractAddress,
    abi,
    functionName: 'balanceOf',
    args: [address!],
    forceEnabled: isSupportedChainId
  });

  const { migrate, isMigrating, isTransactionConfirming } = useMigrate({
    ownerAddress: address!,
    onSuccess() {
      refetchBalance();
      refetchPoolAmount();
    }
  });

  const { buttonText, isButtonDisabled, isFetching } = useMigrateState({
    isConnected,
    isSupportedChainId,
    isMigrating,
    isTransactionConfirming,
    isLoadingOrRefetching,
    value
  });

  const balanceAmount = formatNumericValue(formatted);

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  useEffect(() => {
    const isActive = isMigrating || isTransactionConfirming;
    onTransactionActiveChange && onTransactionActiveChange(isActive);
  }, [isMigrating, isTransactionConfirming, onTransactionActiveChange]);

  return (
    <div>
      <div className="flex h-[4.5rem] items-center justify-center gap-3 self-stretch rounded-[0.3125rem] bg-[#1A1D1F]">
        {isLoadingOrRefetching ? (
          <Loading className="ml-2 gap-1" itemClassName="size-2" />
        ) : (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div>
                  <span className=" text-[1.5rem] font-bold leading-normal text-white">
                    {balanceAmount?.integerPart}
                  </span>
                  {balanceAmount?.decimalPart ? (
                    <span className=" text-[1.5rem] font-bold leading-normal text-white/50">
                      .{balanceAmount?.decimalPart}
                    </span>
                  ) : null}
                </div>
              </TooltipTrigger>
              <TooltipContent asChild>
                <span>{balanceAmount?.originalFormatNumberWithThousandsSeparator}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <span className=" text-[1.5rem] font-bold leading-normal text-white">
          {activeChain?.ktonToken.symbol}
        </span>
      </div>
      <Button
        disabled={isButtonDisabled}
        isLoading={isMigrating || isTransactionConfirming}
        type="button"
        onClick={migrate}
        className="mt-5 w-full rounded-[0.3125rem] text-[0.875rem] text-white"
      >
        {isFetching ? <span className="animate-pulse"> {buttonText}</span> : buttonText}
      </Button>
      <Button
        type="button"
        onClick={() => openInNewTab(newPoolUrl)}
        className="mt-5 w-full rounded-[0.3125rem] text-[0.875rem] text-white"
      >
        {newPoolButtonText}
      </Button>
    </div>
  );

}

export default Migrate; 
