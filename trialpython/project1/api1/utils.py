from .models import CustomUser

APPROVAL_CHAIN_MAP = {
    'csc': ['csc', 'po', 'tmsd', 'afsd', 'regional'],
    'po': ['po', 'tmsd', 'afsd', 'regional'],
    'tmsd': ['tmsd','afsd', 'regional'],
    'afsd': ['afsd', 'regional'],
    'regional': [],
}

def get_approval_chain(user):
    if user.user_level == 'director':
        return []
    return APPROVAL_CHAIN_MAP.get(user.employee_type, [])

def get_next_head(chain, stage, current_user=None):
    while stage < len(chain):
        next_type = chain[stage]

        # Find the head for this stage's department
        qs = CustomUser.objects.filter(employee_type=next_type, user_level='head')

        # Exclude current user (especially if they're a head filing the request)
        if current_user:
            qs = qs.exclude(id=current_user.id)

        next_head = qs.first()
        if next_head:
            return next_head

        # No head found in this stage, try the next stage
        stage += 1

    # Final fallback: director
    qs = CustomUser.objects.filter(user_level='director')
    if current_user:
        qs = qs.exclude(id=current_user.id)

    return qs.first()



#def get_next_head(chain, stage):
    #if stage >= len(chain):
        #return None
    #next_type = chain[stage]
    #return CustomUser.objects.filter(employee_type=next_type, user_level='head').first()