export enum SellToGridLimitState {
    Undefined = -1,
    ActiveLimitFixed = 0,
    NoLimit = 1,
    NoFeasibleSolution = 2,
    ActiveLimitConstraint = 3,
    Disabled = 4,
    NotStarted = 5
}

export function sellToGridLimitStateToString(state: SellToGridLimitState): string {
    switch (state) {
        case SellToGridLimitState.Undefined:
            return "Unknown";
        case SellToGridLimitState.ActiveLimitFixed:
            return "Active (limiting)";
        case SellToGridLimitState.NoLimit:
            return "Active (no limit)";
        case SellToGridLimitState.NoFeasibleSolution:
            return "No feasible solution";
        case SellToGridLimitState.ActiveLimitConstraint:
            return "Active (limiting)";
        case SellToGridLimitState.Disabled:
            return "Normal";
            case SellToGridLimitState.NotStarted:
                return "Active (not started)"
    }
}
