const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importar cors

const app = express();

// Configurar CORS
app.use(cors());



app.use(bodyParser.json());

const PUERTO = process.env.PORT || 3306;

const conexion = mysql.createConnection({
    host: 'bzcshl1sodk5akovfrpd-mysql.services.clever-cloud.com',
    database: 'bzcshl1sodk5akovfrpd',
    user: 'uvbvtkfpsz4rmfaq',
    password: 'YWBSv09RCqw4mkA64OAi'
});

conexion.connect((err) => {
    if (err) {
        console.error('Error obteniendo conexión:', err.stack);
        return;
    }
    console.log('Conexión exitosa con el id ' + conexion.threadId);
});

// Ejemplo de ruta
app.get('/', (req, res) => {
    res.send('API');
});

app.listen(PUERTO, () => {
    console.log(`Servidor corriendo en el puerto ${PUERTO}`);
});


app.get('/', (req, res) => {
    res.send('API');
});

app.get('/obtenerusuarios', (req, res) => {
    const query = `SELECT * FROM usuario WHERE estado = 1`;

    conexion.query(query, (error, resultado) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send('Error en la consulta');
        }

        if (resultado.length > 0) {
            const obj = { listaUsuarios: resultado };
            res.json(obj);
        } else {
            res.status(404).send('No hay registros');
        }
    });
});

app.get('/usuario/estado/:id', (req, res) => {
    const userId = req.params.id;

    // Consulta para obtener el estado del usuario
    const query = 'SELECT estado FROM usuario WHERE id = ?';
    conexion.query(query, [userId], (error, results) => {
        if (error) {
            console.error(error.message);
            return res.status(500).json({ error: 'Error al consultar el estado del usuario' });
        }

        if (results.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Devolver solo el estado como número
        const estado = results[0].estado;
        res.json(estado);
    });
});


app.get('/usuarios', (req, res) => {
    const query = `
        SELECT 
            usuario.id,
            usuario.nombre,
            usuario.apellido,
            usuario.correo,
            usuario.id_rol,
            usuario.estado,
            rol.nombre as rol_nombre
        FROM usuario
        JOIN rol ON usuario.id_rol = rol.id;
    `;

    conexion.query(query, (error, resultado) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send('Error en la consulta');
        }

        if (resultado.length > 0) {
            const obj = { listaUsuarios: resultado };
            res.json(obj);
        } else {
            res.status(404).send('No hay registros');
        }
    });
});

app.get('/usuario/:id', (req, res) => {
    const { id } = req.params;

    const query = `SELECT * FROM usuario WHERE id=${id};`;
    conexion.query(query, (error, resultado) => {
        if (error) return console.error(error.message);

        if (resultado.length > 0) {
            res.json(resultado);
        } else {
            res.send('No hay registros');
        }
    });
});

app.post('/usuario/add', (req, res) => {
    const usuario = {
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        correo: req.body.correo,
        contrasena: req.body.contrasena,
        id_rol: req.body.id_rol,
        estado: 1 // Establecer el estado por defecto como activo
    };

    const query = `INSERT INTO usuario SET ?`;
    conexion.query(query, usuario, (error) => {
        if (error) return console.error(error.message);

        res.json(`Se insertó correctamente el usuario`);
    });
});

app.put('/usuario/update/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, correo, contrasena, id_rol, estado } = req.body;

    // Construimos la consulta sin comentarios dentro de ella
    const query = `
      UPDATE usuario 
      SET 
          nombre='${nombre}', 
          apellido='${apellido}', 
          correo='${correo}', 
          contrasena='${contrasena}', 
          id_rol='${id_rol}', 
          estado=${estado}
      WHERE id='${id}';`;

    // Ejecutamos la consulta
    conexion.query(query, (error) => {
        if (error) return console.log(error.message);

        res.json(`Se actualizó correctamente el usuario`);
    });
});


app.put('/usuario/eliminar/:id', (req, res) => {
    const { id } = req.params;

    const query = `
      UPDATE usuario 
      SET estado=0 
      WHERE id='${id}';`;

    conexion.query(query, (error) => {
        if (error) return console.log(error.message);

        res.json(`Usuario desactivado correctamente`);
    });
});

app.put('/usuario/actualizarEstado', (req, res) => {
    const { id } = req.body;  // Extraemos solo el 'id' del cuerpo de la solicitud

    // Consulta para actualizar el estado del usuario a 1 en la base de datos
    const query = `UPDATE usuario SET estado = 1 WHERE id = ?`;

    // Ejecutamos la consulta con el 'id' recibido
    conexion.query(query, [id], (error, results) => {
        if (error) {
            console.error(error.message);
            return res.status(500).json({ message: "Error al actualizar el estado del usuario" });
        }

        if (results.affectedRows > 0) {
            return res.json("Estado actualizado correctamente");
        } else {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
    });
});



app.get('/tarifas', (req, res) => {

    const query = 'SELECT * FROM tarifa;'
    conexion.query(query, (error, resultado) => {
        if(error) return console.error(error.message)

        const obj = {}
        if(resultado.length > 0) {
            obj.listaTarifas = resultado
            res.json(obj)
        } else {
            res.send('No hay registros')
        }
    })
})

app.get('/tarifa/:id', (req, res) => {
    const { id } = req.params

    const query = `SELECT * FROM tarifa WHERE id=${id};`
    conexion.query(query, (error, resultado) => {
        if(error) return console.error(error.message)

        if(resultado.length > 0){
            res.json(resultado);
        } else {
            res.send('No hay registros');
        }
    })
})

app.post('/tarifa/add', (req, res) => {
    const tarifa = {
        descripcion: req.body.descripcion,
        costo_hora: req.body.costo_hora        
    }

    const query = `INSERT INTO tarifa SET ?`
    conexion.query(query, tarifa, (error) => {
        if(error) return console.error(error.message)

        res.json(`Se insertó correctamente la tarifa`)
    })
})

app.put('/tarifa/update/:id', (req, res) => {
    const { id } = req.params
    const { descripcion, costo_hora } = req.body

    const query = `UPDATE tarifa SET descripcion='${descripcion}', costo_hora='${costo_hora}' WHERE id='${id}';`
    conexion.query(query, (error) => {
        if(error) return console.log(error.message)

        res.json(`Se actualizó correctamente la tarifa`)
    })
})

app.delete('/tarifa/delete/:id', (req, res) => {
    const { id } = req.params

    const query = `DELETE FROM tarifa WHERE id=${id};`
    conexion.query(query, (error) => {
        if(error) return console.log(error.message)

        res.json(`Se eliminó correctamente la tarifa`)
    })
})

app.get('/roles', (req, res) => {

    const query = 'SELECT * FROM rol;'
    conexion.query(query, (error, resultado) => {
        if(error) return console.error(error.message)

        const obj = {}
        if(resultado.length > 0) {
            obj.listaRoles = resultado
            res.json(obj)
        } else {
            res.send('No hay registros')
        }
    })
})

app.get('/rol/:id', (req, res) => {
    const { id } = req.params

    const query = `SELECT * FROM rol WHERE id=${id};`
    conexion.query(query, (error, resultado) => {
        if(error) return console.error(error.message)

        if(resultado.length > 0){
            res.json(resultado);
        } else {
            res.send('No hay registros');
        }
    })
})

app.post('/rol/add', (req, res) => {
    const rol = {
        nombre: req.body.nombre     
    }

    const query = `INSERT INTO rol SET ?`
    conexion.query(query, rol, (error) => {
        if(error) return console.error(error.message)

        res.json(`Se insertó correctamente el rol`)
    })
})

app.put('/rol/update/:id', (req, res) => {
    const { id } = req.params
    const { nombre } = req.body

    const query = `UPDATE rol SET nombre='${nombre}' WHERE id='${id}';`
    conexion.query(query, (error) => {
        if(error) return console.log(error.message)

        res.json(`Se actualizó correctamente el rol`)
    })
})

app.delete('/rol/delete/:id', (req, res) => {
    const { id } = req.params

    const query = `DELETE FROM rol WHERE id=${id};`
    conexion.query(query, (error) => {
        if(error) return console.log(error.message)

        res.json(`Se eliminó correctamente el rol`)
    })
})


app.get('/registros/:id', (req, res) => {
    const idUsuario = req.params.id; // Obtener el id_usuario de los parámetros de ruta

    // Verificar que se haya proporcionado un id_usuario
    if (!idUsuario) {
        return res.status(400).send('El id_usuario es requerido'); // Mensaje de error si falta el id_usuario
    }

    // Modificar la consulta para filtrar por id_usuario y estado = 1
    const query = 'SELECT * FROM registro WHERE (estado = 1 OR estado = 2)   AND id_usuario = ?;'; 
    conexion.query(query, [idUsuario], (error, resultado) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send('Error en el servidor'); // Enviar un mensaje de error
        }

        const obj = {};
        if (resultado.length > 0) {
            obj.listaRegistros = resultado; // Retorna la lista de registros con estado = 1 y el id_usuario especificado
            res.json(obj);
        } else {
            res.send('No hay registros con estado 1 para el usuario especificado');
        }
    });
});

app.get('/verregistros', (req, res) => {
    const query = 'SELECT * FROM registro  WHERE estado = 1 OR estado = 2;'; // Filtra por estado = 1
    conexion.query(query, (error, resultado) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send('Error en el servidor'); // Enviar un mensaje de error
        }

        const obj = {};
        if (resultado.length > 0) {
            obj.listaRegistros = resultado; // Retorna la lista de registros con estado = 1
            res.json(obj);
        } else {
            res.send('No hay registros con estado 1');
        }
    });
});

app.get('/listarregistros', (req, res) => {
    const query = `
        SELECT 
            registro.id,
            DATE(registro.fecha_ingreso) AS fecha_ingreso,
            TIME(registro.fecha_ingreso) AS hora_ingreso,
            DATE(registro.fecha_salida) AS fecha_salida,
            TIME(registro.fecha_salida) AS hora_salida,
            TIMEDIFF(registro.fecha_salida, registro.fecha_ingreso) AS tiempo_diferencia,
            registro.id_espacio,
            registro.patente_vehiculo,
            CONCAT(usuario.nombre, ' ', usuario.apellido) AS nombre_completo,
            registro.estado
        FROM registro
        JOIN usuario ON registro.id_usuario = usuario.id
        WHERE registro.estado = 0;
    `;

    conexion.query(query, (error, resultado) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send('Error en la consulta');
        }

        if (resultado.length > 0) {
            const obj = { listaRegistros: resultado };
            res.json(obj);
        } else {
            res.status(404).send('No hay registros con estado = 0');
        }
    });
});




app.get('/registro/:patente', (req, res) => {
    const { patente } = req.params

    const query = `SELECT registro.*, tarifa.costo_hora
    FROM registro
    INNER JOIN tarifa ON registro.id_tarifa = tarifa.id
    WHERE registro.patente_vehiculo = '${patente}' AND registro.costo_total = 0;`
    conexion.query(query, (error, resultado) => {
        if(error) return console.error(error.message)

        if(resultado.length > 0){
            res.json(resultado);
        } else {
            res.send('No hay registros');
        }
    })
})

app.post('/registro/add', (req, res) => {
    const registro = {
        fecha_ingreso: req.body.fecha_ingreso,
        fecha_salida: req.body.fecha_salida,
        id_espacio: req.body.id_espacio,
        patente_vehiculo: req.body.patente_vehiculo,
        id_usuario: req.body.id_usuario,
        estado: 1
    };

    // Consulta para insertar el registro
    const insertQuery = `INSERT INTO registro SET ?`;

    // Consulta para actualizar el estado del usuario
    const updateQuery = `UPDATE usuario SET estado = 2 WHERE id = ?`;

    // Iniciar transacción
    conexion.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error al iniciar transacción', error: err.message });
        }

        // Ejecutar la consulta de inserción
        conexion.query(insertQuery, registro, (insertError) => {
            if (insertError) {
                return conexion.rollback(() => {
                    res.status(500).json({ message: 'Error al insertar registro', error: insertError.message });
                });
            }

            // Ejecutar la consulta de actualización
            conexion.query(updateQuery, [registro.id_usuario], (updateError) => {
                if (updateError) {
                    return conexion.rollback(() => {
                        res.status(500).json({ message: 'Error al actualizar estado del usuario', error: updateError.message });
                    });
                }

                // Confirmar transacción
                conexion.commit((commitError) => {
                    if (commitError) {
                        return conexion.rollback(() => {
                            res.status(500).json({ message: 'Error al confirmar transacción', error: commitError.message });
                        });
                    }

                    res.json({ message: 'Registro insertado y estado del usuario actualizado correctamente' });
                });
            });
        });
    });
});





app.put('/registro/update/:id', (req, res) => {
    const { id } = req.params
    const { fecha_ingreso, fecha_salida, id_espacio, patente_vehiculo, id_usuario, id_tarifa, costo_total } = req.body

    const query = `UPDATE registro SET fecha_ingreso='${fecha_ingreso}', fecha_salida='${fecha_salida}', id_espacio='${id_espacio}', patente_vehiculo='${patente_vehiculo}', id_usuario='${id_usuario}', id_tarifa='${id_tarifa}', costo_total='${costo_total}' WHERE id='${id}';`
    conexion.query(query, (error) => {
        if(error) return console.log(error.message)

        res.json(`Se actualizó correctamente el registro`)
    })
})

app.put('/registro2/update/:id', (req, res) => {
    const { id } = req.params;

    // Obtener el id_espacio relacionado con el registro
    const getEspacioQuery = `SELECT id_espacio FROM registro WHERE id = ?;`;
    conexion.query(getEspacioQuery, [id], (error, resultado) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send('Error al obtener el espacio relacionado');
        }

        if (resultado.length === 0) {
            return res.status(404).send('Registro no encontrado');
        }

        const idEspacio = resultado[0].id_espacio;

        // Actualizar el atributo disponible en espacio
        const updateEspacioQuery = `UPDATE espacio SET disponible = 1 WHERE id = ?;`;
        conexion.query(updateEspacioQuery, [idEspacio], (error) => {
            if (error) {
                console.error(error.message);
                return res.status(500).send('Error al actualizar el atributo disponible en espacio');
            }

            // Obtener la fecha y hora actuales en la zona horaria local
            const localDate = new Date().toLocaleString("en-US", { 
                timeZone: "America/Lima",  // Ajustar a la zona horaria local (usa la zona horaria que necesites)
                timeZoneName: "short"      // Incluye la abreviatura de la zona horaria (ej. GMT-5)
            });

            // Formatear la fecha a YYYY-MM-DD HH:MM:SS
            const formattedDate = new Date(localDate).toISOString().slice(0, 19).replace('T', ' '); // Formato YYYY-MM-DD HH:MM:SS

            // Actualizar el estado y la fecha_salida en registro
            const updateRegistroQuery = `UPDATE registro SET estado = 0, fecha_salida = ? WHERE id = ?;`;
            conexion.query(updateRegistroQuery, [formattedDate, id], (error) => {
                if (error) {
                    console.error(error.message);
                    return res.status(500).send('Error al actualizar el atributo estado y fecha_salida en registro');
                }

                res.json({ mensaje: 'Los registros fueron actualizados correctamente' });
            });
        });
    });
});


app.put('/registro2/update2/:id', (req, res) => {
    const { id } = req.params;

    // Obtener el id_espacio relacionado con el registro
    const getEspacioQuery = `SELECT id_espacio FROM registro WHERE id = ?;`;
    conexion.query(getEspacioQuery, [id], (error, resultado) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send('Error al obtener el espacio relacionado');
        }

        if (resultado.length === 0) {
            return res.status(404).send('Registro no encontrado');
        }

        const idEspacio = resultado[0].id_espacio;

        // Actualizar el atributo disponible en espacio
        const updateEspacioQuery = `UPDATE espacio SET disponible = 0 WHERE id = ?;`;
        conexion.query(updateEspacioQuery, [idEspacio], (error) => {
            if (error) {
                console.error(error.message);
                return res.status(500).send('Error al actualizar el atributo disponible en espacio');
            }

            // Obtener la fecha y hora actuales en el formato deseado
            const fechaSalida = new Date();
            const offset = fechaSalida.getTimezoneOffset(); // Obtener el offset en minutos
            const localDate = new Date(fechaSalida.getTime() - offset * 60000); // Ajustar a la zona horaria local

            // Formatear la fecha a YYYY-MM-DD HH:MM:SS
            const formattedDate = localDate.toISOString().slice(0, 19).replace('T', ' '); // Formato YYYY-MM-DD HH:MM:SS

            // Actualizar el estado y la fecha_salida en registro
            const updateRegistroQuery = `UPDATE registro SET estado = 2, fecha_salida = ? WHERE id = ?;`;
            conexion.query(updateRegistroQuery, [formattedDate, id], (error) => {
                if (error) {
                    console.error(error.message);
                    return res.status(500).send('Error al actualizar el atributo estado y fecha_salida en registro');
                }

                res.json({ mensaje: 'Los registros fueron actualizados correctamente' });
            });
        });
    });
});




app.delete('/registro/delete/:id', (req, res) => {
    const { id } = req.params

    const query = `DELETE FROM registro WHERE id=${id};`
    conexion.query(query, (error) => {
        if(error) return console.log(error.message)

        res.json(`Se eliminó correctamente el registro`)
    })
})


app.get('/espacios', (req, res) => {
    const query = 'SELECT * FROM espacio WHERE disponible = 1;'
    conexion.query(query, (error, resultado) => {
        if (error) return console.error(error.message)

        const obj = {}
        if (resultado.length > 0) {
            obj.listaEspacios = resultado
            res.json(obj)
        } else {
            res.send('No hay registros')
        }
    })
})

app.get('/verespacios', (req, res) => {
    const query = 'SELECT * FROM espacio;'
    conexion.query(query, (error, resultado) => {
        if (error) return console.error(error.message)

        const obj = {}
        if (resultado.length > 0) {
            obj.listaEspacios = resultado
            res.json(obj)
        } else {
            res.send('No hay registros')
        }
    })
})


app.get('/espacio/:id', (req, res) => {
    const { id } = req.params

    const query = `SELECT * FROM espacio WHERE id=${id};`
    conexion.query(query, (error, resultado) => {
        if (error) return console.error(error.message)

        if (resultado.length > 0) {
            res.json(resultado)
        } else {
            res.send('No hay registros')
        }
    })
})

app.post('/espacio/add', (req, res) => {
    const espacio = {
        numero: req.body.numero,
        disponible: req.body.disponible
    }

    const query = `INSERT INTO espacio SET ?`
    conexion.query(query, espacio, (error) => {
        if (error) return console.error(error.message)

        res.json(`Se insertó correctamente el espacio`)
    })
})

app.put('/espacio/update/:id', (req, res) => {
    const { id } = req.params
    const { numero, disponible } = req.body

    const query = `UPDATE espacio SET numero='${numero}', disponible='${disponible}' WHERE id='${id}';`
    conexion.query(query, (error) => {
        if (error) return console.log(error.message)

        res.json(`Se actualizó correctamente el espacio`)
    })
})

app.delete('/espacio/delete/:id', (req, res) => {
    const { id } = req.params

    const query = `DELETE FROM espacio WHERE id=${id};`
    conexion.query(query, (error) => {
        if (error) return console.log(error.message)

        res.json(`Se eliminó correctamente el espacio`)
    })
});

app.post('/login', (req, res) => {
    const { correo, contrasena } = req.body;
  
    // Realiza la lógica de autenticación, por ejemplo, consulta en la base de datos
    const query = `SELECT * FROM usuario WHERE correo='${correo}' AND contrasena='${contrasena}';`
    conexion.query(query, (error, resultado) => {
      if (error) return console.error(error.message);
  
      if (resultado.length > 0) {
        // Los datos de inicio de sesión son correctos
        // Puedes devolver una respuesta con un token de autenticación u otra información relevante
        res.json({ mensaje: 'Inicio de sesión exitoso', usuario: resultado[0] });
      } else {
        // Los datos de inicio de sesión son incorrectos
        res.status(401).json({ mensaje: 'Credenciales inválidas' });
      }
    });
  });
