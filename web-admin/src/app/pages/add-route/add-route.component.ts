// Importaciones necesarias para el componente
import { Component, OnInit, OnDestroy, ApplicationRef } from '@angular/core'; // Componente base de Angular, ciclos de vida y detección de cambios
import { CommonModule } from '@angular/common'; // Módulo para directivas comunes de Angular como ngIf, ngFor
import { FormsModule } from '@angular/forms'; // Módulo para trabajar con formularios en Angular (ej. ngModel)
import { FirebaseDatabaseService } from '../../services/firebase-database.service'; // Servicio personalizado para interactuar con Firebase Firestore
import { orderBy, where, QueryConstraint } from 'firebase/firestore'; // Funciones de Firebase para construir consultas (ordenar, filtrar)
import { Observable, forkJoin, map, Subject, takeUntil, from, take, of, EMPTY, catchError } from 'rxjs'; // Librería RxJS para manejo de eventos asíncronos y flujos de datos
import { Conductor, Transporte, TipoCarga, Turno, Vuelta, Local, Gestion, Estado } from '../../models/models'; // Importación de interfaces/modelos de datos para el proyecto

/**
 * @interface RegistroDespacho
 * Define la estructura de un registro de despacho tal como se muestra en la interfaz de usuario.
 * Incluye el ID del documento y propiedades para conductor, transporte, tipo de carga, etc.
 */
interface RegistroDespacho {
    id: string; // ID único del registro en la base de datos
    conductor: string; // Nombre del conductor
    transporte: string; // Patente o identificación del transporte
    tipo_carga: string; // Tipo de carga transportada
    turno: string; // Turno de trabajo
    vuelta: string; // Número o tipo de vuelta
    local: string; // Local de destino
    gestion: string; // Tipo de gestión realizada
    estado: string; // Estado actual del despacho (ej. Pendiente, Completado)
    fecha: Date | string; // Fecha del registro, puede ser un objeto Date o un string
}

/**
 * @interface NuevoRegistroForm
 * Define la estructura de los datos del formulario para agregar un nuevo registro.
 * Todas las propiedades son strings, ya que provienen directamente de los campos del formulario.
 */
interface NuevoRegistroForm {
    conductor: string;
    transporte: string;
    tipo_carga: string;
    turno: string;
    vuelta: string;
    local: string;
    gestion: string;
    estado: string;
    fecha: string; // La fecha se maneja como string en el formulario
}

/**
 * @Component AddRouteComponent
 * Componente principal para la adición y gestión de registros de rutas o despachos.
 * Utiliza los módulos CommonModule y FormsModule para su funcionamiento.
 */
@Component({
    selector: 'app-add-route', // Selector CSS para usar este componente en plantillas
    standalone: true, // Indica que este es un componente "standalone" (no necesita un NgModule contenedor)
    imports: [CommonModule, FormsModule], // Módulos que este componente utiliza
    templateUrl: './add-route.component.html', // Ruta al archivo de plantilla HTML
    styleUrls: ['./add-route.component.scss'] // Rutas a los archivos de estilos SCSS
})
export class AddRouteComponent implements OnInit, OnDestroy {

    /**
     * Función trackBy para optimizar el rendimiento de ngFor al iterar sobre listas de conductores.
     * Ayuda a Angular a identificar qué elementos han cambiado, se han añadido o eliminado.
     * @param index Índice del elemento en la lista.
     * @param item Objeto con propiedad 'nombre'.
     * @returns El nombre del item, usado como identificador único.
     */
    trackByNombre(index: number, item: { nombre: string }): string {
        return item.nombre;
    }

    /**
     * Función trackBy para optimizar el rendimiento de ngFor al iterar sobre la lista de registros.
     * @param index Índice del elemento en la lista.
     * @param item Objeto RegistroDespacho.
     * @returns El ID del registro, usado como identificador único.
     */
    trackById(index: number, item: RegistroDespacho): string {
        return item.id;
    }

    /**
     * Función trackBy para optimizar el rendimiento de ngFor al iterar sobre listas de transportes.
     * @param index Índice del elemento en la lista.
     * @param item Objeto con propiedad 'patente'.
     * @returns La patente del item, usado como identificador único.
     */
    trackByPatente(index: number, item: { patente: string }): string {
        return item.patente;
    }

    /**
     * Función trackBy para optimizar el rendimiento de ngFor al iterar sobre listas de locales.
     * @param index Índice del elemento en la lista.
     * @param item Objeto con propiedad 'local'.
     * @returns El local del item, usado como identificador único.
     */
    trackByLocal(index: number, item: { local: string }): string {
        return item.local;
    }

    // Subject para gestionar la cancelación de suscripciones RxJS al destruir el componente
    private readonly destroy$ = new Subject<void>();

    // Criterios de filtro para la tabla de registros
    filterCriteria = {
        conductor: '', // Filtro por nombre de conductor
        fecha: '',     // Filtro por fecha
        turno: ''      // Filtro por turno
    };

    // Observable que contiene la lista de registros de despacho. Inicialmente vacío.
    registros$: Observable<RegistroDespacho[]> = of([]);
    // Bandera para indicar si los datos están siendo cargados (muestra un spinner, por ejemplo)
    cargando: boolean = true;

    // Observables para las opciones de los selectores del formulario
    conductores$!: Observable<Conductor[]>;
    transportes$!: Observable<Transporte[]>;
    tiposCarga$!: Observable<TipoCarga[]>;
    turnos$!: Observable<Turno[]>;
    vueltas$!: Observable<Vuelta[]>;
    locales$!: Observable<Local[]>;
    gestiones$!: Observable<Gestion[]>;
    estados$!: Observable<Estado[]>;


    // Modelo de datos para el formulario de nuevo registro, con valores iniciales
    nuevoRegistro: NuevoRegistroForm = {
        conductor: '',
        transporte: '',
        tipo_carga: '',
        turno: '',
        vuelta: '',
        local: '',
        gestion: '',
        estado: 'Pendiente', // Estado predeterminado
        fecha: ''           // Fecha inicial vacía
    };

    /**
     * Constructor del componente. Inyecta el servicio de base de datos de Firebase
     * y ApplicationRef para forzar la detección de cambios si fuera necesario (aunque
     * con Observables y Angular, no suele serlo explícitamente).
     * @param dbService Servicio para interactuar con Firebase Firestore.
     * @param appRef Referencia a la aplicación Angular.
     */
    constructor(private readonly dbService: FirebaseDatabaseService, private readonly appRef: ApplicationRef) {
        console.log('AddRouteComponent: Constructor inicializado.');
    }

    /**
     * Método del ciclo de vida de Angular que se ejecuta después de que el componente
     * ha sido inicializado. Aquí se cargan los datos iniciales.
     */
    ngOnInit(): void {
        console.log('AddRouteComponent: ngOnInit ejecutado. Iniciando carga de opciones de formulario y registros.');

        this.cargando = true; // Activa el indicador de carga

        // Utiliza forkJoin para cargar todas las colecciones de Firebase en paralelo.
        // Cada `from(this.dbService.readCollection(...))` convierte una Promise en un Observable.
        // `map` transforma el QuerySnapshot de Firebase en un array de objetos de modelo.
        // `take(1)` asegura que cada Observable solo emita un valor y luego se complete.
        forkJoin([
            from(this.dbService.readCollection('CONDUCTOR')).pipe(map(qs => qs.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conductor))), take(1)),
            from(this.dbService.readCollection('TRANSPORTE')).pipe(map(qs => qs.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transporte))), take(1)),
            from(this.dbService.readCollection('TIPO_CARGA')).pipe(map(qs => qs.docs.map(doc => ({ id: doc.id, ...doc.data() } as TipoCarga))), take(1)),
            from(this.dbService.readCollection('TURNO')).pipe(map(qs => qs.docs.map(doc => ({ id: doc.id, ...doc.data() } as Turno))), take(1)),
            from(this.dbService.readCollection('VUELTA')).pipe(map(qs => qs.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vuelta))), take(1)),
            from(this.dbService.readCollection('LOCAL')).pipe(map(qs => qs.docs.map(doc => ({ id: doc.id, ...doc.data() } as Local))), take(1)),
            from(this.dbService.readCollection('GESTION')).pipe(map(qs => qs.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gestion))), take(1)),
            from(this.dbService.readCollection('ESTADO')).pipe(map(qs => qs.docs.map(doc => ({ id: doc.id, ...doc.data() } as Estado))), take(1)),
            // También se carga la lista inicial de registros
            this.getAndMapRegistros().pipe(take(1))
        ]).pipe(
            // `takeUntil(this.destroy$)` cancela la suscripción cuando el componente se destruye
            takeUntil(this.destroy$),
            // Manejo de errores para la carga inicial de datos
            catchError(error => {
                console.error('Página: Error crítico al cargar datos iniciales (opciones de formulario o registros):', error);
                this.cargando = false; // Desactiva el indicador de carga en caso de error
                return EMPTY; // Retorna un Observable vacío para completar el flujo y evitar más emisiones
            })
        )
            .subscribe({
                // Callback para cuando todos los Observables de forkJoin emiten sus valores
                next: ([conductores, transportes, tiposCarga, turnos, vueltas, locales, gestiones, estados, registros]) => {
                    // Asigna los datos recibidos a los Observables del componente
                    this.conductores$ = of(conductores);
                    this.transportes$ = of(transportes);
                    this.tiposCarga$ = of(tiposCarga);
                    this.turnos$ = of(turnos);
                    this.vueltas$ = of(vueltas);
                    this.locales$ = of(locales);
                    this.gestiones$ = of(gestiones);
                    this.estados$ = of(estados);
                    this.registros$ = of(registros); // Asigna los registros iniciales

                    console.log('Página: Todos los datos iniciales (opciones y registros) cargados exitosamente.');
                    this.cargando = false; // Desactiva el indicador de carga
                },
                // Callback para manejar errores específicos de la suscripción
                error: (error) => {
                    console.error('Página: Fallback de error en suscripción de datos iniciales:', error);
                    this.cargando = false; // Desactiva el indicador de carga
                }
            });
    }

    /**
     * Método del ciclo de vida de Angular que se ejecuta justo antes de que el componente sea destruido.
     * Se usa para limpiar recursos, como cancelar suscripciones RxJS, para evitar fugas de memoria.
     */
    ngOnDestroy() {
        this.destroy$.next();     // Emite un valor para que takeUntil cancele las suscripciones
        this.destroy$.complete(); // Completa el Subject
        console.log('AddRouteComponent: Componente destruido. Suscripciones RxJS canceladas.');
    }

    /**
     * Construye un array de restricciones de consulta (QueryConstraint) para Firebase Firestore
     * basándose en los criterios de filtro actuales.
     * @returns Un array de QueryConstraint.
     */
    private buildQueryConstraints(): QueryConstraint[] {
        const queryConstraints: QueryConstraint[] = [];
        // Siempre ordena los registros por fecha de forma descendente
        queryConstraints.push(orderBy('fecha', 'desc'));

        // Agrega filtros si los criterios correspondientes están definidos
        if (this.filterCriteria.conductor) {
            console.log(`Filtro: Añadiendo filtro por conductor: ${this.filterCriteria.conductor}`);
            queryConstraints.push(where('conductor', '==', this.filterCriteria.conductor));
        }
        if (this.filterCriteria.turno) {
            console.log(`Filtro: Añadiendo filtro por turno: ${this.filterCriteria.turno}`);
            queryConstraints.push(where('turno', '==', this.filterCriteria.turno));
        }
        if (this.filterCriteria.fecha) {
            const selectedDate = new Date(this.filterCriteria.fecha);
            // Valida si la fecha es válida
            if (isNaN(selectedDate.getTime())) {
                console.warn('Filtro: Fecha de filtro ingresada es inválida. Saltando filtro de fecha.');
            } else {
                console.log(`Filtro: Añadiendo filtro por fecha: ${this.filterCriteria.fecha}`);

                // Calcula el inicio y fin del día en UTC para asegurar que el filtro de fecha
                // funcione correctamente independientemente de la zona horaria del cliente.
                const startOfDay = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0, 0));
                const endOfDay = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59, 999));

                console.log(`Filtro: Rango de fecha UTC para la consulta - Inicio: ${startOfDay.toISOString()}, Fin: ${endOfDay.toISOString()}`);

                queryConstraints.push(where('fecha', '>=', startOfDay));
                queryConstraints.push(where('fecha', '<=', endOfDay));
            }
        }
        return queryConstraints;
    }

    /**
     * Obtiene los registros de despacho de Firebase y los mapea a la interfaz RegistroDespacho,
     * manejando la conversión de fechas si es necesario.
     * @returns Un Observable que emite un array de RegistroDespacho.
     */
    private getAndMapRegistros(): Observable<RegistroDespacho[]> {
        console.log('Registros: Invocando getAndMapRegistros para obtener datos.');
        const queryConstraints = this.buildQueryConstraints(); // Obtiene las restricciones de consulta

        // Llama al servicio para leer la colección y aplica operadores RxJS
        return from(this.dbService.readCollection('REGISTRO_DESPACHO', ...queryConstraints)).pipe(
            // Primer map: transforma el QuerySnapshot de Firebase a un array de RegistroDespacho.
            map(querySnapshot => {
                if (!querySnapshot?.docs) {
                    console.warn('Registros: QuerySnapshot o docs es nulo/indefinido durante getAndMapRegistros. Retornando array vacío.');
                    return [];
                }
                const mappedData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RegistroDespacho));
                console.log('Registros: Datos obtenidos y mapeados en getAndMapRegistros:', mappedData);
                return mappedData;
            }),
            // Segundo map: se encarga de convertir los objetos de fecha de Firebase (Timestamp) o strings
            // a objetos Date de JavaScript para un manejo consistente en el frontend.
            map((registros: RegistroDespacho[]) => {
                console.log('Registros: Iniciando conversión de fechas en getAndMapRegistros. Datos antes de conversión:', registros);
                return registros.map((registro: RegistroDespacho) => {
                    // Si la fecha es un objeto de Firebase Firestore Timestamp (tiene método .toDate())
                    if ((registro.fecha as any)?.toDate) {
                        registro.fecha = (registro.fecha as any).toDate();
                    }
                    // Si la fecha es un string que se puede parsear a Date
                    else if (typeof registro.fecha === 'string' && !isNaN(new Date(registro.fecha).getTime())) {
                        registro.fecha = new Date(registro.fecha);
                    }
                    // Si la fecha no es ni Timestamp ni un string válido, se considera inválida
                    else if (!(registro.fecha instanceof Date)) {
                        console.warn(`Registros: Fecha inválida para registro ID ${registro.id} en getAndMapRegistros. Estableciendo fecha por defecto. Valor original:`, registro.fecha);
                        registro.fecha = new Date(0); // Establece una fecha por defecto (Epoch)
                    }
                    return registro;
                });
            }),
            // Manejo de errores para esta operación
            catchError(error => {
                console.error('Registros: Error en getAndMapRegistros durante la lectura/mapeo:', error);
                return of([]); // Retorna un Observable vacío en caso de error
            })
        );
    }

    /**
     * Agrega un nuevo registro de despacho a la base de datos de Firebase.
     * Es una función asíncrona porque interactúa con el servicio de base de datos.
     */
    async agregarRegistro() {
        let fechaParaGuardar: Date;

        // Si se proporcionó una fecha en el formulario, la usa. De lo contrario, usa la fecha y hora actual.
        if (this.nuevoRegistro.fecha && this.nuevoRegistro.fecha.trim() !== '') {
            fechaParaGuardar = new Date(this.nuevoRegistro.fecha);
        } else {
            console.warn('Operación: No se proporcionó fecha, usando fecha y hora actual.');
            fechaParaGuardar = new Date();
        }

        // Valida que la fecha obtenida sea válida
        if (isNaN(fechaParaGuardar.getTime())) {
            console.error('Operación: La fecha y hora proporcionadas resultaron en una fecha inválida:', this.nuevoRegistro.fecha);
            this.cargando = false; // Desactiva el indicador de carga
            alert('La fecha y hora ingresada no es válida. Por favor, corrígela.');
            return; // Sale de la función si la fecha es inválida
        }

        // Crea el objeto del nuevo registro con la fecha ajustada
        const nuevo = {
            ...this.nuevoRegistro,
            fecha: fechaParaGuardar
        };

        console.log('Operación: Preparando nuevo registro para agregar (con fecha ajustada):', nuevo);
        this.cargando = true; // Activa el indicador de carga

        try {
            // Llama al servicio para crear el documento en la colección 'REGISTRO_DESPACHO'
            await this.dbService.createDocument('REGISTRO_DESPACHO', nuevo);
            console.log('Operación: Nuevo registro agregado exitosamente.');
            this.resetNuevoRegistro(); // Resetea el formulario después de agregar
            console.log('Operación: Formulario de nuevo registro reseteado.');
            this.reloadRecords(); // Recarga la lista de registros para mostrar el nuevo
        } catch (error) {
            console.error('Operación: Error al agregar el registro:', error);
        } finally {
            this.cargando = false; // Desactiva el indicador de carga, independientemente del resultado
        }
    }

    /**
     * Muestra un cuadro de diálogo de confirmación antes de eliminar un registro.
     * @param id El ID del registro a eliminar.
     */
    confirmarEliminar(id: string) {
        console.log(`Operación: Solicitud de confirmación para eliminar registro ID: ${id}`);
        // Muestra una ventana de confirmación al usuario
        const confirmado = window.confirm('¿Estás seguro que quieres eliminar este registro? Esta acción no se puede deshacer.');
        if (confirmado) {
            console.log(`Operación: Confirmación de eliminación aceptada para ID: ${id}`);
            this.eliminarRegistro(id); // Si confirma, llama a la función de eliminación
        } else {
            console.log(`Operación: Eliminación cancelada por el usuario para ID: ${id}`);
        }
    }

    /**
     * Elimina un registro específico de la base de datos de Firebase.
     * Es una función asíncrona.
     * @param id El ID del registro a eliminar.
     */
    async eliminarRegistro(id: string) {
        console.log(`Operación: Iniciando eliminación de registro con ID: ${id}`);
        this.cargando = true; // Activa el indicador de carga

        try {
            // Llama al servicio para eliminar el documento
            await this.dbService.deleteDocument('REGISTRO_DESPACHO', id);
            console.log(`Operación: Registro ${id} eliminado exitosamente.`);
            this.reloadRecords(); // Recarga la lista de registros para actualizar la vista
        } catch (error) {
            console.error('Operación: Error al eliminar el registro:', error);
        } finally {
            this.cargando = false; // Desactiva el indicador de carga
        }
    }

    /**
     * Recarga la lista de registros de despacho aplicando los filtros actuales.
     * Utiliza `getAndMapRegistros` para obtener los datos más recientes.
     */
    private reloadRecords(): void {
        console.log('Recarga: Iniciando recarga manual de registros.');
        this.cargando = true; // Activa el indicador de carga
        // Llama a la función para obtener y mapear registros
        this.getAndMapRegistros().pipe(
            take(1),              // Toma solo el primer valor emitido
            takeUntil(this.destroy$) // Cancela la suscripción si el componente se destruye
        ).subscribe({
            next: (records) => {
                this.registros$ = of(records); // Actualiza el Observable de registros
                console.log('Recarga: Registros recargados exitosamente.');
                this.cargando = false; // Desactiva el indicador de carga
            },
            error: (err) => {
                console.error('Recarga: Error durante la recarga manual de registros:', err);
                this.registros$ = of([]); // En caso de error, muestra una lista vacía
                this.cargando = false; // Desactiva el indicador de carga
            }
        });
    }

    /**
     * Resetea el modelo del formulario de nuevo registro a sus valores iniciales.
     */
    private resetNuevoRegistro() {
        this.nuevoRegistro = {
            conductor: '',
            transporte: '',
            tipo_carga: '',
            turno: '',
            vuelta: '',
            local: '',
            gestion: '',
            estado: 'Pendiente',
            fecha: ''
        };
    }

    /**
     * Aplica los filtros de búsqueda a la lista de registros.
     * Simplemente llama a `reloadRecords` para que se apliquen las restricciones de consulta.
     */
    applyFilters() {
        console.log('Filtro: Aplicando filtros. Criterios actuales:', this.filterCriteria);
        this.reloadRecords(); // La recarga de registros incluirá los nuevos filtros
    }

    /**
     * Resetea todos los criterios de filtro y luego recarga la lista de registros.
     */
    resetFilters() {
        console.log('Filtro: Reiniciando filtros.');
        // Restablece los criterios de filtro a sus valores predeterminados (vacíos)
        this.filterCriteria = {
            conductor: '',
            fecha: '',
            turno: ''
        };
        this.reloadRecords(); // Recarga los registros sin filtros
        console.log('Filtro: Disparando recarga de datos sin filtros.');
    }
}