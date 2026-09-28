from rest_framework import permissions


class EsPacientePropioOStaff(permissions.BasePermission):
    """
    Defensa en profundidad además del filtro en get_queryset: staff ve todo,
    un paciente solo puede tocar objetos que sean (o pertenezcan a) su propio
    Paciente.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        paciente_propio = getattr(request.user, "paciente", None)
        if paciente_propio is None:
            return False
        objetivo = obj if isinstance(obj, type(paciente_propio)) else getattr(obj, "paciente", None)
        return objetivo == paciente_propio


class SoloStaffEscribe(permissions.BasePermission):
    """Cualquiera autenticado puede leer; solo staff puede crear/editar/borrar."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


class EsSuperusuario(permissions.BasePermission):
    """
    Reservado para acciones irreversibles: eliminar un Paciente borra en
    cascada su ficha clínica, citas y pagos, así que queda restringido al
    superusuario (no a cualquier cuenta de staff de la clínica).
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)
