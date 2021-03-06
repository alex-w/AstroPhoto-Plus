import socket
import select
import threading
import time
from app import logger
from errors import FailedMethodError, BadRequestError
from utils.threads import start_thread, thread_queue
from queue import Empty
import json
from .errors import PHD2ConnectionError, PHD2MethodError

class PHD2Socket:
    def __init__(self):
        self.__connect = False
        self.__connected = False
        self.__thread = None
        self.recv_queue, self.methods_queue, self.events_queue = thread_queue(), thread_queue(), thread_queue()
        self.__id = 0
        self.__methods_lock = threading.Lock()

    def connect(self, hostname='localhost', port=4400):
        self.__connect = True
        self.__thread = start_thread(self.__socket_loop, hostname, port)
        return self.__get_result().get('connected', False)

    def disconnect(self):
        if not self.__thread:
            return BadRequestError('PHD2 Not connected')
        self.__connect = False
        self.__thread.join()

    def send_method(self, method_name, *parameters, timeout=10):
        if not self.__connected:
            raise PHD2ConnectionError('Error running method {}: PHD2 socket not connected'.format(method_name))
        with self.__methods_lock:
            id = self.__id
            self.__id += 1
            method_object = {
                'method': method_name,
                'params': list(parameters),
                'id': id,
            }
            self.methods_queue.put(method_object)
            result = self.__get_result(timeout=timeout)
            if 'error' in result:
                raise PHD2MethodError(method_name, result['error']['message'], result['error']['code'])
            return result

    def __socket_loop(self, address, port):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as connection:
            try:
                connection.connect((address, port))
                self.__put_result({'connected': True})
            except Exception as e:
                self.__put_error(PHD2ConnectionError(str(e), e))
                return 
            self.__connected = True
            inout = [connection]
            fileobj = connection.makefile()
            try:
                while self.__connect:
                    infds, outfds, errfds = select.select(inout, inout, [], 2)
                    if infds:
                        self.__handle_message(fileobj.readline())
                    if outfds:
                        try:
                            message = self.methods_queue.get_nowait()
                            # logger.debug('PHD2Socket: >>> {}'.format(message))
                            connection.send('{}\r\n'.format(json.dumps(message)).encode() )
                        except Empty:
                            pass
            finally:
                self.__connect = False
                self.__connected = False
                logger.debug('PHD2 socket disconnected')
                self.__put_event('disconnected')

    def get_event(self):
        try:
            return self.events_queue.get_nowait()
        except queue.Empty():
            return None

    def __put_result(self, payload):
        self.recv_queue.put((payload, False))

    def __put_event(self, event_type, payload=None):
        self.events_queue.put({'type': event_type, 'payload': payload})

    def __put_error(self, payload):
        self.recv_queue.put((payload, True))


    def __get_result(self, timeout=10):
        result, is_exception = self.recv_queue.get(timeout)
        #logger.debug('__get_result: {}, {}'.format(result, is_exception))
        if is_exception:
            raise result
        return result


    def __handle_message(self, message):
        if not message:
            # if we're here it's usually because we've been disconnected. TODO: improve checks
            self.__connect = False
            return
        # logger.debug('PHD2Socket: <<< {}'.format(message.strip()))
        data = json.loads(message)
        if data.get('jsonrpc'):
            self.__put_result(data)
        elif data.get('Event'):
            self.__handle_event(data)
        else:
            logger.warning('Received unknown message: {}'.format(message))

    def __handle_event(self, event):
        self.events_queue.put({ 'type': 'phd2_event', 'event': event})



