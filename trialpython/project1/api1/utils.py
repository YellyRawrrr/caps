from .models import CustomUser

APPROVAL_CHAIN_MAP = {
    'csc': ['csc', 'po', 'tmsd', 'afsd', 'regional'],
    'po': ['po', 'tmsd', 'afsd', 'regional'],
    'tmsd': ['tmsd','afsd', 'regional'],
    'afsd': ['afsd', 'regional'],
    'regional': [],
}

def get_approval_chain(user):
    """
    Returns the correct approval chain based on the user's role and type.
    """

    if user.user_level == 'director':
        # Director cannot file travel orders
        return []

    # CSC Employee
    if user.employee_type == 'csc':
        if user.user_level == 'head':
            return ['po', 'tmsd', 'afsd', 'regional']
        else:
            return ['csc', 'po', 'tmsd', 'afsd', 'regional']

    # PO Employee
    if user.employee_type == 'po':
        if user.user_level == 'head':
            return ['tmsd', 'afsd', 'regional']
        else:
            return ['po', 'tmsd', 'afsd', 'regional']

    # TMSD Employee
    if user.employee_type == 'tmsd':
        if user.user_level == 'head':
            return ['afsd', 'regional']
        else:
            return ['tmsd', 'afsd', 'regional']

    # AFSD Employee
    if user.employee_type == 'afsd':
        return ['afsd', 'regional']

    # Regional Employee (non-director)
    if user.employee_type == 'regional':
        return ['regional']

    # Fallback
    return []


def get_next_head(chain, stage, current_user=None):
    """
    Returns the next head approver based on the approval chain and current stage.
    Ensures the same user doesn't approve twice.
    """
    while stage < len(chain):
        next_type = chain[stage]

        # Strictly get the head for the next stage
        qs = CustomUser.objects.filter(employee_type=next_type, user_level='head')

        # Avoid returning the same person again
        if current_user:
            qs = qs.exclude(id=current_user.id)

        next_head = qs.first()
        if next_head:
            return next_head

        # Skip to next stage if no head found
        stage += 1

    # Final fallback: Director (if not same as current)
    qs = CustomUser.objects.filter(user_level='director')
    if current_user:
        qs = qs.exclude(id=current_user.id)

    return qs.first()





#def get_next_head(chain, stage):
    #if stage >= len(chain):
        #return None
    #next_type = chain[stage]
    #return CustomUser.objects.filter(employee_type=next_type, user_level='head').first()