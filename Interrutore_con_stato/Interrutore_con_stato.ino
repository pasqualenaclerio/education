int pinLed = 12;      //pin per il led
int pinSwitch = 11;  //pin per l'interruttore
bool lettura;        //creo un contenuotre dove mettere la lettura del pulsante
bool stato = LOW;     //imposto uno stato a basso;

void setup() {
  pinMode(pinLed, OUTPUT);  //settiamo il pin del led a ingresso
  pinMode(pinSwitch, INPUT); //settiamo il pin dell'interruttore a uscita
}

void loop() {
  lettura = digitalRead(pinSwitch);  //leggiamo il valore del pin 11 e salviamolo

  if(lettura == HIGH){                    //se la lettura è alta
    stato = !stato;                       //cambia lo stato
    delay(200);                           //aspetta qualche secondo
  }

  if(stato == HIGH){                    //se lo stato è alta
    
      digitalWrite(pinLed, HIGH);        //accendi il led
      
    }
    else{                                //altrimenti
      
      digitalWrite(pinLed, LOW);         //tieni spento il led
      
      }

}
