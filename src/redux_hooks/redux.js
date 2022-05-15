import * as ACTIONS from './constants';
const {
  SET_WEB3,
  SET_ERROR,
  SET_LOADING,
  SET_AMOUNT,
  ACCOUNT_CHANGE,
  TOGGLE_NETWORK,
  NETWORK_CHANGE,
  DICE_ROLLED,
  BET,
  SET_DICE_MESSAGE,
} = ACTIONS;

export const reducer = (state, action) => {
  console.log('type: ', action.type, ' <===> value:', action.value);
  switch (action.type) {
    case SET_WEB3:
      const { web3, contract, account, loading, balance, maxBet } =
        action.value;
      return {
        ...state,
        contract,
        web3,
        account: account[0],
        balance,
        maxBet,
        loading,
      };

    case ACCOUNT_CHANGE:
      const { getNewBalance, getNewMaxBet, newAddress } = action.value;

      return {
        ...state,
        balance: getNewBalance,
        maxBet: getNewMaxBet,
        account: newAddress,
        loading: false,
      };

    case NETWORK_CHANGE:
      const { getNetBalance, getNetAccounts, getNetMaxBet, networkId } =
        action.value;
      return {
        ...state,
        balance: getNetBalance,
        maxBet: getNetMaxBet,
        account: getNetAccounts,
        networkId,
        loading: false,
        wrongNetwork: false,
      };

    case DICE_ROLLED:
      return {
        ...state,
        diceRolled: action.value,
        loading: false,
      };

    case BET:
      return {
        ...state,
        bet: action.value,
      };

    case SET_AMOUNT:
      return {
        ...state,
        amount: action.value,
      };

    case TOGGLE_NETWORK:
      return {
        ...state,
        wrongNetwork: !state.wrongNetwork,
      };

    case SET_DICE_MESSAGE:
      return {
        ...state,
        diceClose: !state.diceClose,
      };

    case SET_ERROR:
      return {
        ...state,
        errors: action.value,
        formLoading: false,
      };

    case SET_LOADING: {
      return {
        ...state,
        loading: !state.loading,
      };
    }

    default:
      return {
        ...state,
      };
  }
};
