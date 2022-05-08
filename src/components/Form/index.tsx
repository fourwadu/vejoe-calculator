import { useEffect, useState } from "react";

import Input from "./Input";

import {
	balancePair,
	balanceTokens,
	fetchBalance,
	getJoePrice,
	getLPReserves,
	getLPs,
	tokenPrice,
	totalAllocPoint,
} from "../../web3";
import { LPData, ReserveData } from "../../web3/types";
import Result from "../Result";

const Form = () => {
	const [selectedPool, setSelectedPool] = useState<LPData>();

	const [token0, setToken0] = useState<number>(0);
	const [token1, setToken1] = useState<number>(0);
	const [joePrice, setJoePrice] = useState<number>(0);

	const [address, setAddress] = useState<string>("");
	const [balance, setBalance] = useState<number>(0);
	const [reserves, setReserves] = useState<ReserveData>();

	const [pools, setPools] = useState<LPData[]>([]);
	const [token0Price, setToken0Price] = useState<number>();
	useEffect(() => {
		setToken0(0);
		setToken1(0);

		if (!selectedPool) return;

		tokenPrice(selectedPool.lpAddress, 0).then(setToken0Price);
		getJoePrice().then(setJoePrice);
		getLPReserves(selectedPool).then(setReserves);
		console.log(token0Price);
	}, [selectedPool, joePrice, token0Price]);

	useEffect(() => {
		getLPs().then(setPools);
	}, []);

	useEffect(() => {
		async function getBalance() {
			if (!address) return;
			fetchBalance(address).then(setBalance);
		}
		getBalance();
	}, [address]);

	return (
		<div className="bg-joe-light-blue flex justify-start flex-col p-4 w-[650px] text-white text-md font-semibold">
			Calculate Boost
			<div className="w-full flex flex-col gap-y-1 my-4">
				<div className="text-gray-500 text-xs font-medium">Select Farm</div>
				<select
					className="bg-joe-dark-blue h-8 border border-joe-purple focus:outline-none text-xs"
					defaultValue="Select Farm"
					value={selectedPool?.pair}
					onChange={(e) => {
						setSelectedPool(pools.find((pool) => pool.pair === e.target.value));
					}}
				>
					<option value="Select Farm">Select Farm</option>
					{pools.map((pool, _) => {
						return (
							<option key={_} value={pool.pair}>
								{pool.pair}
							</option>
						);
					})}
				</select>
				<div className="flex justify-between gap-x-2 w-full">
					<Input
						name={selectedPool?.token0Name || "Select a farm..."}
						placeholder={!selectedPool ? "Select a farm to continue..." : ""}
						onChange={async (e) => {
							if (!selectedPool) return;
							setToken0(e.target.valueAsNumber);

							const pair = await balanceTokens(
								selectedPool!.lpAddress,
								e.target.valueAsNumber,
								0
							);

							setToken1(pair);
						}}
						value={token0}
						type="number"
						disabled={!selectedPool}
					/>
					<Input
						name={selectedPool?.token1Name || "Select a farm..."}
						placeholder={!selectedPool ? "Select a farm to continue..." : ""}
						onChange={async (e) => {
							if (!selectedPool) return;
							setToken1(e.target.valueAsNumber);

							const pair = await balanceTokens(
								selectedPool!.lpAddress,
								e.target.valueAsNumber,
								1
							);

							setToken0(pair);
						}}
						value={token1}
						type="number"
						disabled={!selectedPool}
					/>
				</div>
				<div className="flex justify-between gap-x-2 w-full">
					<Input
						name="address"
						onChange={(e) => setAddress(e.target.value)}
						value={address}
					/>
					<Input
						name="balance"
						onChange={(e) => setBalance(Number(e.target.value))}
						value={balance}
						type="number"
					/>
				</div>
			</div>
			{selectedPool &&
			totalAllocPoint &&
			token0 &&
			token1 &&
			joePrice &&
			reserves &&
			token0Price ? (
				<>
					Your APR
					<Result
						{...{
							totalAllocPoint,
							token0,
							token1,
							joePrice,
							token0Price,
							poolData: selectedPool,
							reserve: reserves,
							veJoe: balance,
						}}
					/>
				</>
			) : null}
		</div>
	);
};

export default Form;
