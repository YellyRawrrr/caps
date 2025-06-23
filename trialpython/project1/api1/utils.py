from .models import CustomUser

APPROVAL_CHAIN_MAP = {
    'csc': ['csc', 'po', 'tmsd', 'afsd', 'regional'],
    'po': ['po', 'tmsd', 'afsd', 'regional'],
    'tmsd': ['afsd', 'regional'],
    'afsd': ['regional'],
    'regional': [],
}

def get_approval_chain(user):
    if user.user_level == 'director':
        return []
    return APPROVAL_CHAIN_MAP.get(user.employee_type, [])

def get_next_head(chain, stage):
    if stage >= len(chain):
        return None

    next_type = chain[stage]

    # First, check if there's a 'head' user for the next type
    next_head = CustomUser.objects.filter(employee_type=next_type, user_level='head').first()

    # If none and it's the last stage (regional), fallback to director
    if not next_head and next_type == 'regional':
        next_head = CustomUser.objects.filter(user_level='director').first()

    return next_head


#def get_next_head(chain, stage):
    #if stage >= len(chain):
        #return None
    #next_type = chain[stage]
    #return CustomUser.objects.filter(employee_type=next_type, user_level='head').first()